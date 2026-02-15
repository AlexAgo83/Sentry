const CACHE_VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE_PREFIX = "sentry-runtime-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const INVENTORY_ICON_ASSETS = [
    "/img/icons/inventory/apprentice_staff.svg",
    "/img/icons/inventory/armor.svg",
    "/img/icons/inventory/artifact.svg",
    "/img/icons/inventory/bones.svg",
    "/img/icons/inventory/cloth.svg",
    "/img/icons/inventory/cloth_cap.svg",
    "/img/icons/inventory/crystal.svg",
    "/img/icons/inventory/elixir.svg",
    "/img/icons/inventory/fish.svg",
    "/img/icons/inventory/food.svg",
    "/img/icons/inventory/furniture.svg",
    "/img/icons/inventory/garment.svg",
    "/img/icons/inventory/generic.svg",
    "/img/icons/inventory/gold.svg",
    "/img/icons/inventory/herbs.svg",
    "/img/icons/inventory/ingot.svg",
    "/img/icons/inventory/invocation_tablet.svg",
    "/img/icons/inventory/leather.svg",
    "/img/icons/inventory/leather_gloves.svg",
    "/img/icons/inventory/linen_tunic.svg",
    "/img/icons/inventory/meat.svg",
    "/img/icons/inventory/ore.svg",
    "/img/icons/inventory/potion.svg",
    "/img/icons/inventory/rusty_blade.svg",
    "/img/icons/inventory/signet_ring.svg",
    "/img/icons/inventory/simple_boots.svg",
    "/img/icons/inventory/simple_bow.svg",
    "/img/icons/inventory/slot_amulet.svg",
    "/img/icons/inventory/slot_cape.svg",
    "/img/icons/inventory/slot_feet.svg",
    "/img/icons/inventory/slot_hands.svg",
    "/img/icons/inventory/slot_head.svg",
    "/img/icons/inventory/slot_legs.svg",
    "/img/icons/inventory/slot_ring.svg",
    "/img/icons/inventory/slot_tablet.svg",
    "/img/icons/inventory/slot_torso.svg",
    "/img/icons/inventory/slot_weapon.svg",
    "/img/icons/inventory/stone.svg",
    "/img/icons/inventory/tonic.svg",
    "/img/icons/inventory/tools.svg",
    "/img/icons/inventory/traveler_cape.svg",
    "/img/icons/inventory/warding_amulet.svg",
    "/img/icons/inventory/wood.svg",
    "/img/icons/inventory/worn_trousers.svg"
];

const SKILL_ICON_ASSETS = [
    "/img/icons/skills/Alchemy.svg",
    "/img/icons/skills/Carpentry.svg",
    "/img/icons/skills/Combat.svg",
    "/img/icons/skills/Cooking.svg",
    "/img/icons/skills/Excavation.svg",
    "/img/icons/skills/Fishing.svg",
    "/img/icons/skills/Herbalism.svg",
    "/img/icons/skills/Hunting.svg",
    "/img/icons/skills/Invocation.svg",
    "/img/icons/skills/Leatherworking.svg",
    "/img/icons/skills/MetalWork.svg",
    "/img/icons/skills/Tailoring.svg",
    "/img/icons/skills/default.svg"
];

const CORE_ASSETS = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/icon.svg",
    ...INVENTORY_ICON_ASSETS,
    ...SKILL_ICON_ASSETS
];
const INDEX_URL = "/index.html";
const MANIFEST_PATH_CANDIDATES = [
    "/.vite/manifest.json",
    "/manifest.json"
];
const API_PATH_PREFIXES = [
    "/api/"
];

const isSameOrigin = (request) => request.url.startsWith(self.location.origin);
const isNavigation = (request) => request.mode === "navigate";
const isStaticAsset = (request) => ["script", "style", "image", "font", "manifest"].includes(request.destination);
const normalizeAssetPath = (path) => {
    if (typeof path !== "string" || path.length === 0) {
        return null;
    }
    return path.startsWith("/") ? path : `/${path}`;
};
const isApiRequest = (request) => {
    try {
        const { pathname } = new URL(request.url);
        return API_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    } catch {
        return false;
    }
};
const offlineErrorResponse = () => new Response("Offline", {
    status: 503,
    statusText: "Offline",
    headers: {
        "Content-Type": "text/plain"
    }
});
const collectManifestFiles = (manifest) => {
    if (!manifest || typeof manifest !== "object") {
        return [];
    }
    const files = new Set();
    const visited = new Set();

    const addFile = (file) => {
        const normalized = normalizeAssetPath(file);
        if (normalized) {
            files.add(normalized);
        }
    };

    const visit = (entryKey) => {
        if (typeof entryKey !== "string" || visited.has(entryKey)) {
            return;
        }
        visited.add(entryKey);

        const entry = manifest[entryKey];
        if (!entry || typeof entry !== "object") {
            return;
        }

        addFile(entry.file);
        (entry.css || []).forEach(addFile);
        (entry.assets || []).forEach(addFile);
        (entry.imports || []).forEach(visit);
        (entry.dynamicImports || []).forEach(visit);
    };

    Object.keys(manifest).forEach(visit);
    return [...files];
};
const loadBuildManifest = async () => {
    for (const path of MANIFEST_PATH_CANDIDATES) {
        try {
            const response = await fetch(path, { cache: "no-store" });
            if (!response?.ok) {
                continue;
            }
            return await response.json();
        } catch {
            // Try next candidate.
        }
    }
    return null;
};

self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(CORE_ASSETS);
        try {
            const manifest = await loadBuildManifest();
            if (!manifest) {
                return;
            }
            const files = collectManifestFiles(manifest);
            if (files.length === 0) {
                return;
            }
            await Promise.all(files.map((file) => cache.add(file).catch(() => undefined)));
        } catch {
            // Manifest not available (dev) or fetch failed.
        }
    })());
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
    if (isApiRequest(request)) {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);

        if (isNavigation(request)) {
            const cachedIndex = await cache.match(INDEX_URL);
            if (cachedIndex) {
                event.waitUntil(
                    fetch(request)
                        .then((response) => {
                            if (response.ok) {
                                cache.put(INDEX_URL, response.clone());
                            }
                        })
                        .catch(() => undefined)
                );
                return cachedIndex;
            }
            try {
                const response = await fetch(request);
                if (response.ok) {
                    cache.put(INDEX_URL, response.clone());
                    return response;
                }
                const cachedFallback = await cache.match(INDEX_URL);
                return cachedFallback || response;
            } catch {
                const cachedFallback = await cache.match(INDEX_URL);
                if (cachedFallback) {
                    return cachedFallback;
                }
                const rootFallback = await cache.match("/");
                return rootFallback || offlineErrorResponse();
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
            return offlineErrorResponse();
        }
    })());
});
