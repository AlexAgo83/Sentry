const CACHE_VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE_PREFIX = "sentry-runtime-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const INVENTORY_ICON_ASSETS = [
    "/img/items/armor.svg",
    "/img/items/artifact.svg",
    "/img/items/bones.svg",
    "/img/items/cloth.svg",
    "/img/items/crystal.svg",
    "/img/items/elixir.svg",
    "/img/items/fish.svg",
    "/img/items/food.svg",
    "/img/items/furniture.svg",
    "/img/items/garment.svg",
    "/img/items/generic.svg",
    "/img/items/gold.svg",
    "/img/items/herbs.svg",
    "/img/items/ingot.svg",
    "/img/items/leather.svg",
    "/img/items/meat.svg",
    "/img/items/ore.svg",
    "/img/items/potion.svg",
    "/img/items/stone.svg",
    "/img/items/tonic.svg",
    "/img/items/tools.svg",
    "/img/items/wood.svg",
    "/img/icons/equipment/abyssal_orbit.svg",
    "/img/icons/equipment/apprentice_staff.svg",
    "/img/icons/equipment/apprentice_staff_masterwork.svg",
    "/img/icons/equipment/apprentice_staff_refined.svg",
    "/img/icons/equipment/citadel_bloodseal.svg",
    "/img/icons/equipment/cloth_cap.svg",
    "/img/icons/equipment/cryptbone_charm.svg",
    "/img/icons/equipment/ember_oath_talisman.svg",
    "/img/icons/equipment/forgebound_tablet.svg",
    "/img/icons/equipment/forged_gauntlets.svg",
    "/img/icons/equipment/forgeheart_band.svg",
    "/img/icons/equipment/frostspire_relic.svg",
    "/img/icons/equipment/hardened_jerkin.svg",
    "/img/icons/equipment/hide_hood.svg",
    "/img/icons/equipment/invocation_tablet.svg",
    "/img/icons/equipment/iron_boots.svg",
    "/img/icons/equipment/iron_cuirass.svg",
    "/img/icons/equipment/iron_greaves.svg",
    "/img/icons/equipment/iron_helm.svg",
    "/img/icons/equipment/leather_gloves.svg",
    "/img/icons/equipment/linen_tunic.svg",
    "/img/icons/equipment/nightless_sigil.svg",
    "/img/icons/equipment/nightveil_pendant.svg",
    "/img/icons/equipment/nightveil_tablet.svg",
    "/img/icons/equipment/ruins_luck_loop.svg",
    "/img/icons/equipment/rusty_blade.svg",
    "/img/icons/equipment/rusty_blade_masterwork.svg",
    "/img/icons/equipment/rusty_blade_refined.svg",
    "/img/icons/equipment/signet_ring.svg",
    "/img/icons/equipment/silk_cloak.svg",
    "/img/icons/equipment/silkweave_gloves.svg",
    "/img/icons/equipment/simple_boots.svg",
    "/img/icons/equipment/simple_bow.svg",
    "/img/icons/equipment/simple_bow_masterwork.svg",
    "/img/icons/equipment/simple_bow_refined.svg",
    "/img/icons/equipment/starlit_sigil_tablet.svg",
    "/img/icons/equipment/stoneward_tablet.svg",
    "/img/icons/equipment/studded_leggings.svg",
    "/img/icons/equipment/tanned_mantle.svg",
    "/img/icons/equipment/thronebrand_amulet.svg",
    "/img/icons/equipment/traveler_cape.svg",
    "/img/icons/equipment/warding_amulet.svg",
    "/img/icons/equipment/weaver_boots.svg",
    "/img/icons/equipment/worn_trousers.svg",
    "/img/icons/slots/amulet.svg",
    "/img/icons/slots/cape.svg",
    "/img/icons/slots/feet.svg",
    "/img/icons/slots/hands.svg",
    "/img/icons/slots/head.svg",
    "/img/icons/slots/legs.svg",
    "/img/icons/slots/ring.svg",
    "/img/icons/slots/tablet.svg",
    "/img/icons/slots/torso.svg",
    "/img/icons/slots/weapon.svg"
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
