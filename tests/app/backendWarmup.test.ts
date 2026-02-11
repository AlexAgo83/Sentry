import { afterEach, describe, expect, it, vi } from "vitest";
import { startSilentBackendWarmup } from "../../src/app/backendWarmup";

const flushMicrotasks = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

describe("startSilentBackendWarmup", () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("returns null when base URL is empty", () => {
        const stop = startSilentBackendWarmup("   ", {
            fetchImpl: vi.fn() as unknown as typeof fetch
        });
        expect(stop).toBeNull();
    });

    it("pings health immediately and on each interval", async () => {
        vi.useFakeTimers();
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true } as Response);

        const stop = startSilentBackendWarmup("https://api.example.com/", {
            fetchImpl: fetchImpl as unknown as typeof fetch,
            intervalMs: 1_000,
        });

        await flushMicrotasks();
        expect(fetchImpl).toHaveBeenCalledTimes(1);
        expect(fetchImpl).toHaveBeenNthCalledWith(
            1,
            "https://api.example.com/health",
            expect.objectContaining({ mode: "cors", method: "GET" })
        );

        vi.advanceTimersByTime(1_000);
        await flushMicrotasks();
        expect(fetchImpl).toHaveBeenCalledTimes(2);

        stop?.();
        vi.advanceTimersByTime(2_000);
        await flushMicrotasks();
        expect(fetchImpl).toHaveBeenCalledTimes(2);
    });

    it("falls back to the base URL when health check fails", async () => {
        const fetchImpl = vi.fn()
            .mockResolvedValueOnce({ ok: false } as Response)
            .mockResolvedValueOnce({ ok: true } as Response);

        startSilentBackendWarmup("https://api.example.com", {
            fetchImpl: fetchImpl as unknown as typeof fetch,
            intervalMs: 60_000
        });

        await flushMicrotasks();
        expect(fetchImpl).toHaveBeenNthCalledWith(
            1,
            "https://api.example.com/health",
            expect.objectContaining({ mode: "cors", method: "GET" })
        );
        expect(fetchImpl).toHaveBeenNthCalledWith(
            2,
            "https://api.example.com",
            expect.objectContaining({ mode: "no-cors", method: "GET" })
        );
    });

    it("prevents overlapping warmup calls while one is in flight", async () => {
        vi.useFakeTimers();

        let resolveFetch: ((value: Response) => void) | null = null;
        const fetchImpl = vi.fn().mockImplementation(() => (
            new Promise<Response>((resolve) => {
                resolveFetch = resolve;
            })
        ));

        const stop = startSilentBackendWarmup("https://api.example.com", {
            fetchImpl: fetchImpl as unknown as typeof fetch,
            intervalMs: 1_000
        });

        await flushMicrotasks();
        expect(fetchImpl).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(3_000);
        await flushMicrotasks();
        expect(fetchImpl).toHaveBeenCalledTimes(1);

        if (!resolveFetch) {
            throw new Error("Expected warmup fetch resolver to be available");
        }
        (resolveFetch as (value: Response) => void)({ ok: true } as Response);
        await flushMicrotasks();

        vi.advanceTimersByTime(1_000);
        await flushMicrotasks();
        expect(fetchImpl).toHaveBeenCalledTimes(2);

        stop?.();
    });
});
