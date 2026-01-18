const CACHE_VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE_PREFIX = "sentry-runtime-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const CORE_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg"];
const INDEX_URL = "/index.html";

const isSameOrigin = (request) => request.url.startsWith(self.location.origin);
const isNavigation = (request) => request.mode === "navigate";
const isStaticAsset = (request) => ["script", "style", "image", "font", "manifest"].includes(request.destination);

self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET" || !isSameOrigin(request)) {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);

        if (isNavigation(request)) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    cache.put(INDEX_URL, response.clone());
                    return response;
                }
                const cachedIndex = await cache.match(INDEX_URL);
                return cachedIndex || response;
            } catch {
                const cachedIndex = await cache.match(INDEX_URL);
                return cachedIndex || cache.match("/");
            }
        }

        if (isStaticAsset(request)) {
            const cached = await cache.match(request);
            if (cached) {
                event.waitUntil(
                    fetch(request)
                        .then((response) => {
                            if (response.ok) {
                                cache.put(request, response.clone());
                            }
                        })
                        .catch(() => undefined)
                );
                return cached;
            }
        }

        try {
            const response = await fetch(request);
            if (response.ok && isStaticAsset(request)) {
                cache.put(request, response.clone());
            }
            return response;
        } catch {
            const cached = await cache.match(request);
            if (cached) {
                return cached;
            }
            const cachedIndex = await cache.match(INDEX_URL);
            return cachedIndex || cache.match("/");
        }
    })());
});
