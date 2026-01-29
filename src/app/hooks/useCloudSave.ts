import { useCallback, useEffect, useMemo, useState } from "react";
import { toGameSave } from "../../core/serialization";
import { parseSaveEnvelopeMeta } from "../../adapters/persistence/saveEnvelope";
import { readRawSave } from "../../adapters/persistence/localStorageKeys";
import { selectVirtualScore } from "../selectors/gameSelectors";
import { useGameStore } from "./useGameStore";
import { gameRuntime, gameStore } from "../game";
import { cloudClient } from "../api/cloudClient";

export type CloudSaveMeta = {
    updatedAt: Date | null;
    virtualScore: number;
    appVersion: string;
};

type CloudSaveState = {
    status: "idle" | "authenticating" | "ready" | "error" | "offline";
    error: string | null;
    cloudMeta: CloudSaveMeta | null;
    localMeta: CloudSaveMeta;
    hasCloudSave: boolean;
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

export const useCloudSave = () => {
    const virtualScore = useGameStore(selectVirtualScore);
    const appVersion = useGameStore((state) => state.version);
    const [accessToken, setAccessToken] = useState<string | null>(() => cloudClient.loadAccessToken());
    const [cloudMeta, setCloudMeta] = useState<CloudSaveMeta | null>(null);
    const [cloudPayload, setCloudPayload] = useState<unknown | null>(null);
    const [hasCloudSave, setHasCloudSave] = useState(false);
    const [status, setStatus] = useState<CloudSaveState["status"]>("idle");
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

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

    const authenticate = useCallback(async (mode: "login" | "register", email: string, password: string) => {
        if (!isAvailable) {
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
        }
        setStatus("authenticating");
        setError(null);
        try {
            const token = mode === "register"
                ? await cloudClient.register(email, password)
                : await cloudClient.login(email, password);
            setAccessToken(token);
            setStatus("ready");
        } catch (err) {
            setStatus("error");
            setError(err instanceof Error ? err.message : "Authentication failed.");
        }
    }, [isAvailable]);

    const refreshToken = useCallback(async () => {
        if (!isAvailable) {
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return null;
        }
        try {
            const token = await cloudClient.refresh();
            setAccessToken(token);
            return token;
        } catch (err) {
            setAccessToken(null);
            setStatus("error");
            setError(err instanceof Error ? err.message : "Refresh failed.");
            return null;
        }
    }, [isAvailable]);

    const refreshCloud = useCallback(async () => {
        if (!isAvailable) {
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
        }
        setStatus("idle");
        setError(null);
        try {
            const token = accessToken ?? (await refreshToken());
            const response = await cloudClient.getLatestSave(token);
            if (!response) {
                setHasCloudSave(false);
                setCloudMeta(null);
                setCloudPayload(null);
                setStatus("ready");
                return;
            }
            setHasCloudSave(true);
            setCloudPayload(response.payload);
            setCloudMeta({
                updatedAt: toDateOrNull(response.meta.updatedAt),
                virtualScore: response.meta.virtualScore,
                appVersion: response.meta.appVersion
            });
            setStatus("ready");
        } catch (err) {
            setStatus("error");
            setError(err instanceof Error ? err.message : "Failed to fetch cloud save.");
        }
    }, [accessToken, isAvailable, refreshToken]);

    const loadCloud = useCallback(async () => {
        if (!cloudPayload) {
            setError("No cloud save available.");
            return;
        }
        gameRuntime.importSave(cloudPayload as any);
    }, [cloudPayload]);

    const overwriteCloud = useCallback(async () => {
        if (!isAvailable) {
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
        }
        try {
            const token = accessToken ?? (await refreshToken());
            const payload = toGameSave(gameStore.getState());
            const result = await cloudClient.putLatestSave(token, payload, virtualScore, appVersion);
            setCloudMeta({
                updatedAt: toDateOrNull(result.meta.updatedAt),
                virtualScore: result.meta.virtualScore,
                appVersion: result.meta.appVersion
            });
            setHasCloudSave(true);
            setStatus("ready");
        } catch (err) {
            setStatus("error");
            setError(err instanceof Error ? err.message : "Failed to upload cloud save.");
        }
    }, [accessToken, appVersion, isAvailable, refreshToken, virtualScore]);

    return {
        status,
        error,
        cloudMeta,
        localMeta,
        hasCloudSave,
        isAvailable,
        accessToken,
        authenticate,
        refreshCloud,
        loadCloud,
        overwriteCloud
    } satisfies CloudSaveState & {
        authenticate: (mode: "login" | "register", email: string, password: string) => Promise<void>;
        refreshCloud: () => Promise<void>;
        loadCloud: () => Promise<void>;
        overwriteCloud: () => Promise<void>;
    };
};
