type FetchMode = "cors" | "no-cors";

type BackendWarmupOptions = {
    intervalMs?: number;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
    setTimeoutImpl?: typeof globalThis.setTimeout;
    clearTimeoutImpl?: typeof globalThis.clearTimeout;
    setIntervalImpl?: typeof globalThis.setInterval;
    clearIntervalImpl?: typeof globalThis.clearInterval;
};

export const startSilentBackendWarmup = (
    rawBase: string,
    options: BackendWarmupOptions = {}
): (() => void) | null => {
    const base = rawBase.trim();
    if (!base) {
        return null;
    }

    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    if (!fetchImpl) {
        return null;
    }

    const timeoutMs = options.timeoutMs ?? 1500;
    const intervalMs = options.intervalMs ?? 60_000;
    const setTimeoutImpl = options.setTimeoutImpl ?? globalThis.setTimeout.bind(globalThis);
    const clearTimeoutImpl = options.clearTimeoutImpl ?? globalThis.clearTimeout.bind(globalThis);
    const setIntervalImpl = options.setIntervalImpl ?? globalThis.setInterval.bind(globalThis);
    const clearIntervalImpl = options.clearIntervalImpl ?? globalThis.clearInterval.bind(globalThis);

    const baseUrl = base.replace(/\/+$/u, "");
    const warmupUrl = `${baseUrl}/health`;

    const fetchWithTimeout = async (url: string, mode: FetchMode) => {
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        const timeoutId = controller ? setTimeoutImpl(() => controller.abort(), timeoutMs) : null;
        try {
            return await fetchImpl(url, {
                method: "GET",
                mode,
                credentials: "omit",
                cache: "no-store",
                signal: controller?.signal
            });
        } catch {
            return null;
        } finally {
            if (timeoutId !== null) {
                clearTimeoutImpl(timeoutId);
            }
        }
    };

    let warmupInFlight = false;
    const wakeBackend = async () => {
        if (warmupInFlight) {
            return;
        }
        warmupInFlight = true;
        try {
            const response = await fetchWithTimeout(warmupUrl, "cors");
            if (!response || !response.ok) {
                await fetchWithTimeout(baseUrl, "no-cors");
            }
        } finally {
            warmupInFlight = false;
        }
    };

    void wakeBackend();
    const intervalId = setIntervalImpl(() => {
        void wakeBackend();
    }, intervalMs);

    return () => {
        clearIntervalImpl(intervalId);
    };
};
