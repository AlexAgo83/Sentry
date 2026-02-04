import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toGameSave } from "../../core/serialization";
import { parseSaveEnvelopeMeta } from "../../adapters/persistence/saveEnvelope";
import { readRawSave } from "../../adapters/persistence/localStorageKeys";
import { selectVirtualScore } from "../selectors/gameSelectors";
import { useGameStore } from "./useGameStore";
import { gameRuntime, gameStore } from "../game";
import { CloudApiError, cloudClient } from "../api/cloudClient";

export type CloudSaveMeta = {
    updatedAt: Date | null;
    virtualScore: number;
    appVersion: string;
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

const buildLocalMeta = (virtualScore: number, appVersion: string): CloudSaveMeta => {
    const raw = readRawSave();
    const envelopeMeta = raw ? parseSaveEnvelopeMeta(raw) : { savedAt: null };
    return {
        updatedAt: envelopeMeta.savedAt ? new Date(envelopeMeta.savedAt) : new Date(),
        virtualScore,
        appVersion
    };
};

const isUnauthorizedError = (err: unknown) => err instanceof CloudApiError && err.status === 401;
const WARMUP_RETRY_DELAYS_MS = [1000, 2000, 4000];

const isWarmupError = (err: unknown) => {
    if (err instanceof CloudApiError) {
        return [502, 503, 504].includes(err.status);
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

export const useCloudSave = () => {
    const virtualScore = useGameStore(selectVirtualScore);
    const appVersion = useGameStore((state) => state.version);
    const localHasActiveDungeonRun = useGameStore((state) => Boolean(state.dungeon.activeRunId));
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
    const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
    const warmupRetrySignalRef = useRef<(() => void) | null>(null);
    const backendProbeInFlightRef = useRef(false);
    const lastRequestRef = useRef<(() => Promise<void>) | null>(null);

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
    const applyRequestError = useCallback((err: unknown, fallback: string) => {
        if (isWarmupError(err)) {
            setIsBackendAwake(false);
            setStatus("warming");
            setError(warmupMessage());
            setWarmupRetrySeconds(null);
            return;
        }
        setIsBackendAwake(true);
        setStatus("error");
        setError(err instanceof Error ? err.message : fallback);
    }, []);

    const withWarmupRetry = useCallback(async <T,>(
        statusOnStart: CloudSaveState["status"],
        action: () => Promise<T>
    ): Promise<T> => {
        for (let attempt = 0; attempt <= WARMUP_RETRY_DELAYS_MS.length; attempt += 1) {
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
                const waitMs = WARMUP_RETRY_DELAYS_MS[attempt];
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
            applyRequestError(err, "Authentication failed.");
        }
    }, [applyRequestError, isAvailable, withWarmupRetry]);

    const refreshToken = useCallback(async () => {
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return null;
        }
        setError(null);
        try {
            const token = await withWarmupRetry("authenticating", () => cloudClient.refresh());
            setIsBackendAwake(true);
            setAccessToken(token);
            return token;
        } catch (err) {
            cloudClient.clearAccessToken();
            setAccessToken(null);
            applyRequestError(err, "Refresh failed.");
            return null;
        }
    }, [applyRequestError, isAvailable, withWarmupRetry]);

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

    const refreshCloud = useCallback(async () => {
        lastRequestRef.current = refreshCloud;
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
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
                return;
            }
            setHasCloudSave(true);
            setCloudPayload(response.payload);
            setCloudHasActiveDungeonRun(hasActiveDungeonRunInPayload(response.payload));
            setCloudMeta({
                updatedAt: toDateOrNull(response.meta.updatedAt),
                virtualScore: response.meta.virtualScore,
                appVersion: response.meta.appVersion
            });
            setLastSyncAt(new Date());
            setStatus("ready");
        } catch (err) {
            applyRequestError(err, "Failed to fetch cloud save.");
        }
    }, [applyRequestError, isAvailable, withRefreshRetry, withWarmupRetry]);

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
    }, [accessToken, isAvailable, refreshCloud]);

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

    const loadCloud = useCallback(async () => {
        if (!cloudPayload) {
            setError("No cloud save available.");
            return;
        }
        gameRuntime.importSave(cloudPayload as any);
    }, [cloudPayload]);

    const overwriteCloud = useCallback(async () => {
        lastRequestRef.current = overwriteCloud;
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
        }
        setError(null);
        try {
            const payload = toGameSave(gameStore.getState());
            const result = await withWarmupRetry("idle", () => withRefreshRetry((token) => cloudClient.putLatestSave(
                token,
                payload,
                virtualScore,
                appVersion
            )));
            setIsBackendAwake(true);
            setCloudMeta({
                updatedAt: toDateOrNull(result.meta.updatedAt),
                virtualScore: result.meta.virtualScore,
                appVersion: result.meta.appVersion
            });
            setHasCloudSave(true);
            setLastSyncAt(new Date());
            setStatus("ready");
        } catch (err) {
            applyRequestError(err, "Failed to upload cloud save.");
        }
    }, [appVersion, applyRequestError, isAvailable, virtualScore, withRefreshRetry, withWarmupRetry]);

    const logout = useCallback(() => {
        cloudClient.clearAccessToken();
        setAccessToken(null);
        setCloudMeta(null);
        setCloudPayload(null);
        setHasCloudSave(false);
        setCloudHasActiveDungeonRun(false);
        setStatus("idle");
        setError(null);
        setWarmupRetrySeconds(null);
        setLastSyncAt(null);
    }, []);

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
        authenticate,
        refreshCloud,
        loadCloud,
        overwriteCloud,
        logout,
        retryWarmupNow
    } satisfies CloudSaveState & {
        authenticate: (mode: "login" | "register", email: string, password: string) => Promise<void>;
        refreshCloud: () => Promise<void>;
        loadCloud: () => Promise<void>;
        overwriteCloud: () => Promise<void>;
        logout: () => void;
        retryWarmupNow: () => void;
    };
};
