import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

type ListenerMap = Record<string, (event: any) => void>;

const setupServiceWorker = async () => {
    const listeners: ListenerMap = {};
    const cache = {
        addAll: vi.fn().mockResolvedValue(undefined),
        match: vi.fn(),
        put: vi.fn().mockResolvedValue(undefined)
    };
    const caches = {
        open: vi.fn().mockResolvedValue(cache),
        keys: vi.fn().mockResolvedValue(["sentry-runtime-dev", "sentry-runtime-old"]),
        delete: vi.fn().mockResolvedValue(true)
    };
    const self = {
        location: {
            href: "https://example.com/sw.js?v=dev",
            origin: "https://example.com"
        },
        addEventListener: (event: string, handler: (event: any) => void) => {
            listeners[event] = handler;
        },
        skipWaiting: vi.fn(),
        clients: {
            claim: vi.fn()
        }
    };

    (globalThis as typeof globalThis & { self: typeof self }).self = self;
    (globalThis as typeof globalThis & { caches: typeof caches }).caches = caches;
    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch = vi.fn();

    await import("../../public/sw.js");

    return { listeners, cache, caches, self };
};

describe("service worker", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete (globalThis as { self?: unknown }).self;
        delete (globalThis as { caches?: unknown }).caches;
        delete (globalThis as { fetch?: unknown }).fetch;
    });

    it("caches core assets on install", async () => {
        const { listeners, cache, self } = await setupServiceWorker();
        const waitUntil = vi.fn();

        listeners.install({ waitUntil });

        const promise = waitUntil.mock.calls[0][0];
        await promise;
        expect(waitUntil).toHaveBeenCalledTimes(1);
        expect(cache.addAll).toHaveBeenCalledWith([
            "/",
            "/index.html",
            "/manifest.webmanifest",
            "/icon.svg"
        ]);
        expect(self.skipWaiting).toHaveBeenCalled();
    });

    it("cleans up old caches on activate", async () => {
        const { listeners, caches, self } = await setupServiceWorker();
        const waitUntil = vi.fn();

        listeners.activate({ waitUntil });

        const promise = waitUntil.mock.calls[0][0];
        await promise;
        expect(caches.delete).toHaveBeenCalledWith("sentry-runtime-old");
        expect(self.clients.claim).toHaveBeenCalled();
    });

    it("serves cached pages when offline", async () => {
        const { listeners, cache } = await setupServiceWorker();
        const waitUntil = vi.fn();
        const respondWith = vi.fn();
        const request = {
            method: "GET",
            mode: "navigate",
            url: "https://example.com/dashboard",
            destination: ""
        };

        cache.match.mockResolvedValueOnce("cached-page");
        const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
        fetchMock.mockRejectedValue(new Error("offline"));

        listeners.fetch({ request, respondWith, waitUntil });

        const response = await respondWith.mock.calls[0][0];
        expect(response).toBe("cached-page");
    });

    it("caches navigation responses when online", async () => {
        const { listeners, cache } = await setupServiceWorker();
        const waitUntil = vi.fn();
        const respondWith = vi.fn();
        const request = {
            method: "GET",
            mode: "navigate",
            url: "https://example.com/quests",
            destination: ""
        };

        const response = { ok: true, clone: () => response };
        const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
        fetchMock.mockResolvedValue(response);

        listeners.fetch({ request, respondWith, waitUntil });

        const resolved = await respondWith.mock.calls[0][0];
        expect(resolved).toBe(response);
        expect(cache.put).toHaveBeenCalledWith("/index.html", response);
    });

    it("returns cached index when navigation fetch is not ok", async () => {
        const { listeners, cache } = await setupServiceWorker();
        const waitUntil = vi.fn();
        const respondWith = vi.fn();
        const request = {
            method: "GET",
            mode: "navigate",
            url: "https://example.com/quests",
            destination: ""
        };

        const response = { ok: false, clone: () => response };
        const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
        fetchMock.mockResolvedValue(response);
        cache.match.mockResolvedValueOnce("cached-index");

        listeners.fetch({ request, respondWith, waitUntil });

        const resolved = await respondWith.mock.calls[0][0];
        expect(resolved).toBe("cached-index");
    });

    it("serves cached assets and refreshes in background", async () => {
        const { listeners, cache } = await setupServiceWorker();
        const waitUntil = vi.fn();
        const respondWith = vi.fn();
        const request = {
            method: "GET",
            mode: "no-cors",
            url: "https://example.com/icon.svg",
            destination: "image"
        };

        cache.match.mockResolvedValueOnce("cached-asset");
        const response = { ok: true, clone: () => response };
        const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
        fetchMock.mockResolvedValue(response);

        listeners.fetch({ request, respondWith, waitUntil });

        const resolved = await respondWith.mock.calls[0][0];
        expect(resolved).toBe("cached-asset");
        expect(waitUntil).toHaveBeenCalled();
    });

    it("fetches and caches uncached static assets", async () => {
        const { listeners, cache } = await setupServiceWorker();
        const waitUntil = vi.fn();
        const respondWith = vi.fn();
        const request = {
            method: "GET",
            mode: "no-cors",
            url: "https://example.com/app.js",
            destination: "script"
        };

        cache.match.mockResolvedValueOnce(null);
        const response = { ok: true, clone: () => response };
        const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
        fetchMock.mockResolvedValue(response);

        listeners.fetch({ request, respondWith, waitUntil });

        const resolved = await respondWith.mock.calls[0][0];
        expect(resolved).toBe(response);
        expect(cache.put).toHaveBeenCalledWith(request, response);
    });

    it("falls back to the cached index when fetch fails", async () => {
        const { listeners, cache } = await setupServiceWorker();
        const waitUntil = vi.fn();
        const respondWith = vi.fn();
        const request = {
            method: "GET",
            mode: "no-cors",
            url: "https://example.com/styles.css",
            destination: "style"
        };

        cache.match.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce("cached-index");
        const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
        fetchMock.mockRejectedValue(new Error("network down"));

        listeners.fetch({ request, respondWith, waitUntil });

        const resolved = await respondWith.mock.calls[0][0];
        expect(resolved).toBe("cached-index");
        expect(cache.match).toHaveBeenCalledWith(request);
        expect(cache.match).toHaveBeenCalledWith("/index.html");
    });

    it("returns cached runtime responses when fetch fails", async () => {
        const { listeners, cache } = await setupServiceWorker();
        const waitUntil = vi.fn();
        const respondWith = vi.fn();
        const request = {
            method: "GET",
            mode: "no-cors",
            url: "https://example.com/runtime.json",
            destination: ""
        };

        cache.match.mockResolvedValueOnce("cached-runtime");
        const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
        fetchMock.mockRejectedValue(new Error("offline"));

        listeners.fetch({ request, respondWith, waitUntil });

        const resolved = await respondWith.mock.calls[0][0];
        expect(resolved).toBe("cached-runtime");
    });

    it("ignores non-GET and cross-origin requests", async () => {
        const { listeners } = await setupServiceWorker();
        const respondWith = vi.fn();
        const waitUntil = vi.fn();

        listeners.fetch({
            request: {
                method: "POST",
                mode: "navigate",
                url: "https://example.com/submit",
                destination: ""
            },
            respondWith,
            waitUntil
        });

        listeners.fetch({
            request: {
                method: "GET",
                mode: "navigate",
                url: "https://other.example.com/page",
                destination: ""
            },
            respondWith,
            waitUntil
        });

        expect(respondWith).not.toHaveBeenCalled();
    });

    it("supports skip waiting messages", async () => {
        const { listeners, self } = await setupServiceWorker();

        listeners.message({ data: { type: "SKIP_WAITING" } });

        expect(self.skipWaiting).toHaveBeenCalled();
    });
});
