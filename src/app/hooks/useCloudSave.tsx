import type { ReactNode } from "react";
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toGameSave } from "../../core/serialization";
import { buildSaveFingerprint } from "../../core/saveFingerprint";
import {
    clearCloudSyncWatermark,
    readCloudSyncWatermark,
    writeCloudSyncWatermark,
    type CloudSyncWatermark
} from "../../adapters/persistence/cloudSyncWatermark";
import { parseSaveEnvelopeMeta } from "../../adapters/persistence/saveEnvelope";
import { readRawSave } from "../../adapters/persistence/localStorageKeys";
import { selectVirtualScore } from "../selectors/gameSelectors";
import { useGameStore } from "./useGameStore";
import { gameRuntime, gameStore } from "../game";
import { CloudApiError, cloudClient, type CloudProfile } from "../api/cloudClient";
import { resolveCloudSyncBootstrapDecision } from "../cloudSyncDecision";

export type CloudSaveMeta = {
    updatedAt: Date | null;
    virtualScore: number;
    appVersion: string;
    revision: number | null;
};

type CloudSaveState = {
    status: "idle" | "authenticating" | "ready" | "error" | "offline" | "warming";
    error: string | null;
    warmupRetrySeconds: number | null;
    isBackendAwake: boolean;
    cloudMeta: CloudSaveMeta | null;
    localMeta: CloudSaveMeta;
    lastSyncAt: Date | null;
    hasCloudSave: boolean;
    localHasActiveDungeonRun: boolean;
    cloudHasActiveDungeonRun: boolean;
    isAvailable: boolean;
    accessToken: string | null;
    profile: CloudProfile | null;
    isUpdatingProfile: boolean;
    autoSyncEnabled: boolean;
    autoSyncStatus: "idle" | "syncing" | "conflict";
    autoSyncConflict: { meta: CloudSaveMeta; message: string } | null;
};

const toDateOrNull = (value: string | Date | null): Date | null => {
    if (!value) {
        return null;
    }
    if (value instanceof Date) {
        return value;
    }
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
};

const toRevisionOrNull = (value: unknown): number | null => {
    if (!Number.isFinite(value)) {
        return null;
    }
    return Math.floor(Number(value));
};

const toCloudMetaFromApiMeta = (meta: {
    updatedAt: string | Date | null;
    virtualScore: number;
    appVersion: string;
    revision?: unknown;
}): CloudSaveMeta => ({
    updatedAt: toDateOrNull(meta.updatedAt),
    virtualScore: meta.virtualScore,
    appVersion: meta.appVersion,
    revision: toRevisionOrNull(meta.revision ?? null)
});

const buildLocalMeta = (virtualScore: number, appVersion: string): CloudSaveMeta => {
    const raw = readRawSave();
    const envelopeMeta = raw ? parseSaveEnvelopeMeta(raw) : { savedAt: null };
    return {
        updatedAt: envelopeMeta.savedAt ? new Date(envelopeMeta.savedAt) : new Date(),
        virtualScore,
        appVersion,
        revision: null
    };
};

const isUnauthorizedError = (err: unknown): err is CloudApiError => (
    err instanceof CloudApiError && (err.status === 401 || err.status === 403)
);
const isConflictError = (err: unknown): err is CloudApiError => (
    err instanceof CloudApiError && err.status === 409
);
const WARMUP_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000, 30000];

class CloudWarmupCancelledError extends Error {
    constructor() {
        super("Cloud warmup cancelled.");
        this.name = "CloudWarmupCancelledError";
    }
}

const isWarmupError = (err: unknown) => {
    if (err instanceof CloudApiError) {
        return [502, 503, 504].includes(err.status);
    }
    if (err instanceof DOMException && err.name === "AbortError") {
        return true;
    }
    if (err instanceof Error && err.name === "AbortError") {
        return true;
    }
    if (err instanceof TypeError) {
        return err.message.toLowerCase().includes("fetch");
    }
    return false;
};

const warmupMessage = (seconds?: number) => (
    seconds
        ? `Cloud backend is waking up… retrying in ${seconds}s.`
        : "Cloud backend is still waking up. Please retry in a moment."
);

const isRecord = (value: unknown): value is Record<string, unknown> => (
    Boolean(value) && typeof value === "object"
);

const hasActiveDungeonRunInPayload = (payload: unknown): boolean => {
    if (!isRecord(payload)) {
        return false;
    }
    const dungeon = payload.dungeon;
    if (!isRecord(dungeon)) {
        return false;
    }
    const activeRunId = dungeon.activeRunId;
    return typeof activeRunId === "string" && activeRunId.trim().length > 0;
};

const LOCAL_CLOUD_DIVERGENCE_MESSAGE = "Both local and cloud saves changed since the last sync. Choose which version to keep.";

type LocalSaveSnapshot = {
    payload: ReturnType<typeof toGameSave>;
    fingerprint: string;
};

export type CloudSaveController = CloudSaveState & {
    authenticate: (mode: "login" | "register", email: string, password: string) => Promise<void>;
    refreshCloud: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateUsername: (usernameInput: string) => Promise<{ ok: true } | { ok: false; error: string }>;
    loadCloud: (options?: { payload?: unknown; cloudRevision?: number | null; cloudFingerprint?: string | null }) => Promise<boolean>;
    overwriteCloud: (options?: { expectedRevision?: number | null; localSnapshot?: LocalSaveSnapshot }) => Promise<void>;
    setAutoSyncEnabled: (enabled: boolean) => void;
    resolveAutoSyncConflictByLoadingCloud: () => Promise<void>;
    resolveAutoSyncConflictByOverwritingCloud: () => Promise<void>;
    logout: () => void;
    retryWarmupNow: () => void;
};

const CloudSaveContext = createContext<CloudSaveController | null>(null);

export const CloudSaveProvider = memo(({ children }: { children: ReactNode }) => {
    const value = useCloudSaveInternal();
    return (
        <CloudSaveContext.Provider value={value}>
            {children}
        </CloudSaveContext.Provider>
    );
});

CloudSaveProvider.displayName = "CloudSaveProvider";

export const useCloudSave = (): CloudSaveController => {
    const value = useContext(CloudSaveContext);
    if (!value) {
        throw new Error("useCloudSave must be used within <CloudSaveProvider />");
    }
    return value;
};

const useCloudSaveInternal = (): CloudSaveController => {
    const virtualScore = useGameStore(selectVirtualScore);
    const appVersion = useGameStore((state) => state.version);
    const localHasActiveDungeonRun = useGameStore((state) => Boolean(state.dungeon.activeRunId));
    const autoSyncEnabled = useGameStore((state) => Boolean(state.ui.cloud.autoSyncEnabled));
    const [accessToken, setAccessToken] = useState<string | null>(() => cloudClient.loadAccessToken());
    const [cloudMeta, setCloudMeta] = useState<CloudSaveMeta | null>(null);
    const [cloudPayload, setCloudPayload] = useState<unknown | null>(null);
    const [hasCloudSave, setHasCloudSave] = useState(false);
    const [cloudHasActiveDungeonRun, setCloudHasActiveDungeonRun] = useState(false);
    const [status, setStatus] = useState<CloudSaveState["status"]>("idle");
    const [error, setError] = useState<string | null>(null);
    const [warmupRetrySeconds, setWarmupRetrySeconds] = useState<number | null>(null);
    const [isBackendAwake, setIsBackendAwake] = useState(false);
    const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
    const [profile, setProfile] = useState<CloudProfile | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
    const [autoSyncStatus, setAutoSyncStatus] = useState<CloudSaveState["autoSyncStatus"]>("idle");
    const [autoSyncConflict, setAutoSyncConflict] = useState<CloudSaveState["autoSyncConflict"]>(null);
    const [syncWatermark, setSyncWatermark] = useState<CloudSyncWatermark | null>(() => readCloudSyncWatermark());
    const warmupRetrySignalRef = useRef<(() => void) | null>(null);
    const warmupCancelIdRef = useRef(0);
    const backendProbeInFlightRef = useRef(false);
    const lastRequestRef = useRef<(() => Promise<void>) | null>(null);
    const hasAttemptedSilentRefreshRef = useRef(false);
    const autoSyncBootstrapRef = useRef(0);
    const lastAutoSyncBootstrapSignatureRef = useRef<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const localMeta = useMemo(() => buildLocalMeta(virtualScore, appVersion), [virtualScore, appVersion]);
    const isAvailable = Boolean(cloudClient.getApiBase()) && isOnline;
    const cancelWarmupRetry = useCallback(() => {
        warmupCancelIdRef.current += 1;
        if (warmupRetrySignalRef.current) {
            warmupRetrySignalRef.current();
        }
        warmupRetrySignalRef.current = null;
    }, []);
    const retryWarmupNow = useCallback(() => {
        if (warmupRetrySignalRef.current) {
            warmupRetrySignalRef.current();
            return;
        }
        const lastRequest = lastRequestRef.current;
        if (lastRequest) {
            void lastRequest();
        }
    }, []);
    const resolveErrorMessage = useCallback((err: unknown, fallback: string) => {
        if (err instanceof CloudApiError) {
            try {
                const parsed = JSON.parse(err.body);
                if (parsed && typeof parsed.error === "string") {
                    return parsed.error;
                }
            } catch {
                // Ignore parse failures and fall back to raw body.
            }
            if (err.body) {
                return err.body;
            }
        }
        if (err instanceof Error) {
            return err.message;
        }
        return fallback;
    }, []);

    const setAutoSyncEnabledPreference = useCallback((enabled: boolean) => {
        gameStore.dispatch({ type: "uiSetCloudAutoSyncEnabled", enabled });
        autoSyncBootstrapRef.current += 1;
        if (!enabled) {
            setAutoSyncStatus("idle");
            setAutoSyncConflict(null);
        }
    }, []);

    const persistSyncWatermark = useCallback((next: { cloudRevision: number | null; localFingerprint: string | null }) => {
        const persisted = writeCloudSyncWatermark(next);
        if (persisted) {
            setSyncWatermark(persisted);
            return;
        }
        setSyncWatermark({
            schemaVersion: 1,
            cloudRevision: Number.isFinite(next.cloudRevision) ? Number(next.cloudRevision) : null,
            localFingerprint: typeof next.localFingerprint === "string" && next.localFingerprint.trim().length > 0
                ? next.localFingerprint.trim()
                : null,
            updatedAtMs: Date.now()
        });
    }, []);

    const clearSyncWatermark = useCallback(() => {
        clearCloudSyncWatermark();
        setSyncWatermark(null);
    }, []);

    const buildCurrentLocalSnapshot = useCallback((): LocalSaveSnapshot => {
        const payload = toGameSave(gameStore.getState());
        return {
            payload,
            fingerprint: buildSaveFingerprint(payload)
        };
    }, []);

    const applyRequestError = useCallback((err: unknown, fallback: string) => {
        if (isWarmupError(err)) {
            setIsBackendAwake(false);
            setStatus("warming");
            setError(warmupMessage());
            setWarmupRetrySeconds(null);
            return;
        }
        if (isUnauthorizedError(err) && accessToken) {
            cloudClient.clearAccessToken();
            cloudClient.clearCsrfToken();
            setAccessToken(null);
            setCloudMeta(null);
            setCloudPayload(null);
            setHasCloudSave(false);
            setCloudHasActiveDungeonRun(false);
            setProfile(null);
            setStatus("idle");
            setError("Session expired. Please log in again.");
            return;
        }
        setIsBackendAwake(true);
        setStatus("error");
        setError(resolveErrorMessage(err, fallback));
    }, [accessToken, resolveErrorMessage]);

    const withWarmupRetry = useCallback(async <T,>(
        statusOnStart: CloudSaveState["status"],
        action: () => Promise<T>
    ): Promise<T> => {
        const runId = warmupCancelIdRef.current;
        for (let attempt = 0; attempt <= WARMUP_RETRY_DELAYS_MS.length; attempt += 1) {
            if (warmupCancelIdRef.current !== runId) {
                throw new CloudWarmupCancelledError();
            }
            setWarmupRetrySeconds(null);
            setStatus(statusOnStart);
            try {
                warmupRetrySignalRef.current = null;
                return await action();
            } catch (err) {
                if (!isWarmupError(err) || attempt === WARMUP_RETRY_DELAYS_MS.length) {
                    warmupRetrySignalRef.current = null;
                    setWarmupRetrySeconds(null);
                    throw err;
                }
                const baseMs = WARMUP_RETRY_DELAYS_MS[attempt];
                // Small jitter avoids synchronized thundering-herd retries across clients.
                const waitMs = Math.round(baseMs * (0.85 + Math.random() * 0.3));
                const waitSeconds = Math.max(1, Math.round(waitMs / 1000));
                setStatus("warming");
                setError(warmupMessage(waitSeconds));
                setWarmupRetrySeconds(waitSeconds);
                await new Promise<void>((resolve) => {
                    const timeout = setTimeout(resolve, waitMs);
                    warmupRetrySignalRef.current = () => {
                        clearTimeout(timeout);
                        resolve();
                    };
                });
                warmupRetrySignalRef.current = null;
            }
        }
        throw new Error("Warmup retry exhausted.");
    }, []);

    const authenticate = useCallback(async (mode: "login" | "register", email: string, password: string) => {
        lastRequestRef.current = () => authenticate(mode, email, password);
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
        }
        setError(null);
        try {
            const token = await withWarmupRetry("authenticating", () => (
                mode === "register"
                    ? cloudClient.register(email, password)
                    : cloudClient.login(email, password)
            ));
            setIsBackendAwake(true);
            setAccessToken(token);
            setStatus("ready");
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return;
            }
            applyRequestError(err, "Authentication failed.");
        }
    }, [applyRequestError, isAvailable, withWarmupRetry]);

    const refreshToken = useCallback(async (options?: { silent?: boolean }) => {
        if (!isAvailable) {
            if (!options?.silent) {
                setIsBackendAwake(false);
                setStatus("offline");
                setError("Cloud sync is unavailable.");
            }
            return null;
        }

        if (!options?.silent) {
            setError(null);
        }
        try {
            const attemptRefresh = () => withWarmupRetry("authenticating", () => cloudClient.refresh());
            let token: string | null = null;
            try {
                token = await attemptRefresh();
            } catch (err) {
                // If CSRF is stale, clear it and retry once (best effort).
                if (err instanceof CloudApiError && err.status === 403) {
                    cloudClient.clearCsrfToken();
                    token = await attemptRefresh();
                } else {
                    throw err;
                }
            }
            setIsBackendAwake(true);
            setAccessToken(token);
            return token;
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return null;
            }
            // If we were not authenticated yet (startup silent refresh), do not treat 401/403 as an error.
            if (isUnauthorizedError(err) && !accessToken) {
                setIsBackendAwake(true);
                setStatus("idle");
                if (!options?.silent) {
                    setError(null);
                }
                return null;
            }
            applyRequestError(err, "Refresh failed.");
            return null;
        }
    }, [accessToken, applyRequestError, isAvailable, withWarmupRetry]);

    const withRefreshRetry = useCallback(async <T,>(action: (token: string | null) => Promise<T>): Promise<T> => {
        const token = accessToken ?? (await refreshToken());
        try {
            return await action(token);
        } catch (err) {
            if (!isUnauthorizedError(err)) {
                throw err;
            }
            const refreshed = await refreshToken();
            if (!refreshed) {
                throw err;
            }
            return await action(refreshed);
        }
    }, [accessToken, refreshToken]);

    const fetchLatestCloudSave = useCallback(async (): Promise<Awaited<ReturnType<typeof cloudClient.getLatestSave>>> => {
        lastRequestRef.current = async () => {
            await fetchLatestCloudSave();
        };
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return null;
        }
        setError(null);
        try {
            const response = await withWarmupRetry("idle", () => withRefreshRetry((token) => cloudClient.getLatestSave(token)));
            setIsBackendAwake(true);
            if (!response) {
                setHasCloudSave(false);
                setCloudMeta(null);
                setCloudPayload(null);
                setCloudHasActiveDungeonRun(false);
                setLastSyncAt(new Date());
                setStatus("ready");
                return null;
            }
            setHasCloudSave(true);
            setCloudPayload(response.payload);
            setCloudHasActiveDungeonRun(hasActiveDungeonRunInPayload(response.payload));
            setCloudMeta(toCloudMetaFromApiMeta(response.meta));
            setLastSyncAt(new Date());
            setStatus("ready");
            return response;
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return null;
            }
            applyRequestError(err, "Failed to fetch cloud save.");
            return null;
        }
    }, [applyRequestError, isAvailable, withRefreshRetry, withWarmupRetry]);

    const refreshCloud = useCallback(async () => {
        await fetchLatestCloudSave();
    }, [fetchLatestCloudSave]);

    const refreshProfile = useCallback(async () => {
        lastRequestRef.current = refreshProfile;
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
        }
        setError(null);
        try {
            const profileResponse = await withWarmupRetry("idle", () => withRefreshRetry((token) => cloudClient.getProfile(token)));
            setIsBackendAwake(true);
            setProfile(profileResponse);
            setStatus("ready");
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return;
            }
            applyRequestError(err, "Failed to fetch cloud profile.");
        }
    }, [applyRequestError, isAvailable, withRefreshRetry, withWarmupRetry]);

    const updateUsername = useCallback(async (usernameInput: string): Promise<{ ok: true } | { ok: false; error: string }> => {
        lastRequestRef.current = async () => {
            await updateUsername(usernameInput);
        };
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            const message = "Cloud sync is unavailable.";
            setError(message);
            return { ok: false, error: message };
        }
        setError(null);
        setIsUpdatingProfile(true);
        const normalizedInput = usernameInput.trim();
        try {
            const profileResponse = await withWarmupRetry("idle", () => withRefreshRetry((token) => cloudClient.updateProfile(
                token,
                normalizedInput.length > 0 ? normalizedInput : null
            )));
            setIsBackendAwake(true);
            setProfile(profileResponse);
            setStatus("ready");
            setError(null);
            return { ok: true };
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return { ok: false, error: "Cloud request cancelled." };
            }
            const message = resolveErrorMessage(err, "Failed to update username.");
            applyRequestError(err, message);
            return { ok: false, error: message };
        } finally {
            setIsUpdatingProfile(false);
        }
    }, [applyRequestError, isAvailable, resolveErrorMessage, withRefreshRetry, withWarmupRetry]);

    const probeBackend = useCallback(async () => {
        if (backendProbeInFlightRef.current) {
            return;
        }
        lastRequestRef.current = probeBackend;
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
        }
        backendProbeInFlightRef.current = true;
        setError(null);
        try {
            await withWarmupRetry("idle", () => cloudClient.probeReady());
            setIsBackendAwake(true);
            setStatus((currentStatus) => (currentStatus === "warming" ? "idle" : currentStatus));
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return;
            }
            applyRequestError(err, "Cloud backend is unavailable.");
        } finally {
            backendProbeInFlightRef.current = false;
        }
    }, [applyRequestError, isAvailable, withWarmupRetry]);

    useEffect(() => {
        if (!isAvailable || !accessToken) {
            return;
        }
        refreshCloud();
        refreshProfile();
    }, [accessToken, isAvailable, refreshCloud, refreshProfile]);

    useEffect(() => {
        if (!isAvailable) {
            hasAttemptedSilentRefreshRef.current = false;
            return;
        }
        if (accessToken || hasAttemptedSilentRefreshRef.current) {
            return;
        }
        // Only attempt silent refresh when we have CSRF persisted from a prior login.
        if (!cloudClient.hasStoredCsrfToken()) {
            hasAttemptedSilentRefreshRef.current = true;
            return;
        }
        hasAttemptedSilentRefreshRef.current = true;
        void refreshToken({ silent: true });
    }, [accessToken, isAvailable, refreshToken]);

    useEffect(() => {
        if (!isAvailable) {
            setIsBackendAwake(false);
            return;
        }
        if (accessToken || isBackendAwake || status === "authenticating") {
            return;
        }
        void probeBackend();
    }, [accessToken, isAvailable, isBackendAwake, probeBackend, status]);

    const loadCloud = useCallback(async (options?: {
        payload?: unknown;
        cloudRevision?: number | null;
        cloudFingerprint?: string | null;
    }): Promise<boolean> => {
        const resolvedPayload = options?.payload ?? cloudPayload;
        if (!resolvedPayload) {
            setError("No cloud save available.");
            return false;
        }
        try {
            const resolvedCloudFingerprint = options?.cloudFingerprint ?? buildSaveFingerprint(resolvedPayload);
            gameRuntime.importSave(resolvedPayload as any);
            setError(null);
            setStatus("ready");
            setLastSyncAt(new Date());
            setAutoSyncStatus("idle");
            setAutoSyncConflict(null);
            persistSyncWatermark({
                cloudRevision: options?.cloudRevision ?? cloudMeta?.revision ?? null,
                localFingerprint: resolvedCloudFingerprint
            });
            return true;
        } catch (err) {
            applyRequestError(err, "Failed to load cloud save.");
            return false;
        }
    }, [applyRequestError, cloudMeta?.revision, cloudPayload, persistSyncWatermark]);

    const overwriteCloud = useCallback(async (options?: { expectedRevision?: number | null; localSnapshot?: LocalSaveSnapshot }) => {
        lastRequestRef.current = overwriteCloud;
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
        }
        setError(null);
        try {
            const localSnapshot = options?.localSnapshot ?? buildCurrentLocalSnapshot();
            const payload = localSnapshot.payload;
            const expectedRevision = options?.expectedRevision ?? cloudMeta?.revision ?? null;
            const result = await withWarmupRetry("idle", () => withRefreshRetry((token) => cloudClient.putLatestSave(
                token,
                payload,
                virtualScore,
                appVersion,
                { expectedRevision }
            )));
            const nextCloudMeta = toCloudMetaFromApiMeta(result.meta);
            setIsBackendAwake(true);
            setCloudMeta(nextCloudMeta);
            setCloudPayload(payload);
            setHasCloudSave(true);
            setLastSyncAt(new Date());
            setStatus("ready");
            setAutoSyncStatus("idle");
            setAutoSyncConflict(null);
            persistSyncWatermark({
                cloudRevision: nextCloudMeta.revision,
                localFingerprint: localSnapshot.fingerprint
            });
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return;
            }
            if (isConflictError(err)) {
                const message = LOCAL_CLOUD_DIVERGENCE_MESSAGE;
                const parsed = (() => {
                    try {
                        return JSON.parse(err.body) as any;
                    } catch {
                        return null;
                    }
                })();
                const metaRaw = parsed?.meta ?? null;
                const conflictMeta: CloudSaveMeta = {
                    updatedAt: toDateOrNull(metaRaw?.updatedAt ?? null),
                    virtualScore: Number.isFinite(metaRaw?.virtualScore) ? Number(metaRaw.virtualScore) : (cloudMeta?.virtualScore ?? 0),
                    appVersion: typeof metaRaw?.appVersion === "string" ? metaRaw.appVersion : (cloudMeta?.appVersion ?? appVersion),
                    revision: toRevisionOrNull(metaRaw?.revision ?? null)
                };
                setAutoSyncStatus("conflict");
                setAutoSyncConflict({ meta: conflictMeta, message });
                setCloudMeta(conflictMeta);
                setHasCloudSave(true);
                setStatus("ready");
                setError(message);
                return;
            }
            applyRequestError(err, "Failed to upload cloud save.");
        }
    }, [
        appVersion,
        applyRequestError,
        buildCurrentLocalSnapshot,
        cloudMeta,
        isAvailable,
        persistSyncWatermark,
        virtualScore,
        withRefreshRetry,
        withWarmupRetry
    ]);

    const autoSyncPushIfNeeded = useCallback(async () => {
        if (!autoSyncEnabled || autoSyncStatus === "conflict") {
            return;
        }
        if (!isAvailable || !accessToken) {
            return;
        }
        if (!isBackendAwake || status === "warming" || status === "authenticating") {
            return;
        }

        const localSnapshot = buildCurrentLocalSnapshot();
        if (syncWatermark?.localFingerprint && localSnapshot.fingerprint === syncWatermark.localFingerprint) {
            return;
        }

        // Ensure we have a concurrency token before pushing (best effort).
        let expectedRevision = cloudMeta?.revision ?? syncWatermark?.cloudRevision ?? null;
        if (hasCloudSave && expectedRevision === null) {
            const refreshed = await fetchLatestCloudSave();
            expectedRevision = refreshed?.meta ? toRevisionOrNull((refreshed.meta as any).revision) : null;
        }

        setAutoSyncStatus("syncing");
        await overwriteCloud({ expectedRevision, localSnapshot });
        setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
    }, [
        accessToken,
        autoSyncEnabled,
        autoSyncStatus,
        buildCurrentLocalSnapshot,
        cloudMeta,
        fetchLatestCloudSave,
        hasCloudSave,
        isAvailable,
        isBackendAwake,
        overwriteCloud,
        syncWatermark?.cloudRevision,
        syncWatermark?.localFingerprint,
        status
    ]);

    useEffect(() => {
        if (!autoSyncEnabled) {
            return;
        }
        const intervalId = window.setInterval(() => {
            if (document.visibilityState !== "visible") {
                return;
            }
            void autoSyncPushIfNeeded();
        }, 30_000);
        return () => window.clearInterval(intervalId);
    }, [autoSyncEnabled, autoSyncPushIfNeeded]);

    useEffect(() => {
        if (!autoSyncEnabled) {
            return;
        }
        const handleVisibility = () => {
            if (document.visibilityState !== "hidden") {
                return;
            }
            void autoSyncPushIfNeeded();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [autoSyncEnabled, autoSyncPushIfNeeded]);

    useEffect(() => {
        if (!autoSyncEnabled || autoSyncStatus === "conflict") {
            return;
        }
        if (!isAvailable || !accessToken) {
            return;
        }
        if (!isBackendAwake || status === "warming" || status === "authenticating") {
            return;
        }

        const signature = `${autoSyncBootstrapRef.current}:${accessToken ? "1" : "0"}`;
        if (lastAutoSyncBootstrapSignatureRef.current === signature) {
            return;
        }
        lastAutoSyncBootstrapSignatureRef.current = signature;

        setAutoSyncStatus("syncing");
        void (async () => {
            const localSnapshot = buildCurrentLocalSnapshot();
            const latest = await fetchLatestCloudSave();
            const cloudRevision = latest ? toRevisionOrNull((latest.meta as any).revision) : null;
            const decision = resolveCloudSyncBootstrapDecision({
                watermark: syncWatermark,
                hasCloudSave: Boolean(latest),
                cloudRevision,
                localFingerprint: localSnapshot.fingerprint
            });

            if (!latest && decision === "overwrite_cloud") {
                await overwriteCloud({ expectedRevision: null, localSnapshot });
                setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
                return;
            }

            if (!latest || decision === "noop") {
                setAutoSyncStatus("idle");
                return;
            }

            const cloudMetaSnapshot = toCloudMetaFromApiMeta(latest.meta);
            const cloudFingerprint = buildSaveFingerprint(latest.payload);
            if (localHasActiveDungeonRun && decision === "load_cloud") {
                setAutoSyncStatus("idle");
                return;
            }

            if (decision === "load_cloud") {
                await loadCloud({
                    payload: latest.payload,
                    cloudRevision: cloudMetaSnapshot.revision,
                    cloudFingerprint
                });
                setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
                return;
            }

            if (decision === "overwrite_cloud") {
                await overwriteCloud({ expectedRevision: cloudMetaSnapshot.revision, localSnapshot });
                setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
                return;
            }

            const message = LOCAL_CLOUD_DIVERGENCE_MESSAGE;
            setAutoSyncStatus("conflict");
            setAutoSyncConflict({
                meta: cloudMetaSnapshot,
                message
            });
            setCloudMeta(cloudMetaSnapshot);
            setError(message);
            setStatus("ready");
        })();
    }, [
        accessToken,
        autoSyncEnabled,
        autoSyncStatus,
        buildCurrentLocalSnapshot,
        fetchLatestCloudSave,
        isAvailable,
        isBackendAwake,
        loadCloud,
        localHasActiveDungeonRun,
        overwriteCloud,
        syncWatermark,
        status
    ]);

    const logout = useCallback(() => {
        cancelWarmupRetry();
        cloudClient.clearAccessToken();
        cloudClient.clearCsrfToken();
        clearSyncWatermark();
        setAccessToken(null);
        setCloudMeta(null);
        setCloudPayload(null);
        setHasCloudSave(false);
        setCloudHasActiveDungeonRun(false);
        setProfile(null);
        setIsUpdatingProfile(false);
        setStatus("idle");
        setError(null);
        setWarmupRetrySeconds(null);
        setLastSyncAt(null);
    }, [cancelWarmupRetry, clearSyncWatermark]);

    useEffect(() => {
        if (isAvailable) {
            return;
        }
        // Stop any pending warmup retries when cloud becomes unavailable (offline / missing API base).
        cancelWarmupRetry();
    }, [cancelWarmupRetry, isAvailable]);

    useEffect(() => {
        if (status !== "warming") {
            if (warmupRetrySeconds !== null) {
                setWarmupRetrySeconds(null);
            }
            return;
        }
        if (warmupRetrySeconds === null || warmupRetrySeconds <= 0) {
            return;
        }
        const timeout = setTimeout(() => {
            setWarmupRetrySeconds((prev) => (prev && prev > 0 ? prev - 1 : prev));
        }, 1000);
        return () => clearTimeout(timeout);
    }, [status, warmupRetrySeconds]);

    const resolveAutoSyncConflictByLoadingCloud = useCallback(async () => {
        setAutoSyncStatus("syncing");
        const latest = await fetchLatestCloudSave();
        if (latest) {
            await loadCloud({
                payload: latest.payload,
                cloudRevision: toRevisionOrNull((latest.meta as any).revision),
                cloudFingerprint: buildSaveFingerprint(latest.payload)
            });
        }
        setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
        setAutoSyncConflict(null);
    }, [fetchLatestCloudSave, loadCloud]);

    const resolveAutoSyncConflictByOverwritingCloud = useCallback(async () => {
        const expectedRevision = autoSyncConflict?.meta.revision ?? cloudMeta?.revision ?? null;
        setAutoSyncStatus("syncing");
        await overwriteCloud({ expectedRevision });
        setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
        setAutoSyncConflict(null);
    }, [autoSyncConflict, cloudMeta, overwriteCloud]);

    return {
        status,
        error,
        warmupRetrySeconds,
        isBackendAwake,
        cloudMeta,
        localMeta,
        lastSyncAt,
        hasCloudSave,
        localHasActiveDungeonRun,
        cloudHasActiveDungeonRun,
        isAvailable,
        accessToken,
        profile,
        isUpdatingProfile,
        autoSyncEnabled,
        autoSyncStatus,
        autoSyncConflict,
        authenticate,
        refreshCloud,
        refreshProfile,
        updateUsername,
        loadCloud,
        overwriteCloud,
        setAutoSyncEnabled: setAutoSyncEnabledPreference,
        resolveAutoSyncConflictByLoadingCloud,
        resolveAutoSyncConflictByOverwritingCloud,
        logout,
        retryWarmupNow
    } satisfies CloudSaveController;
};
