export const SW_UPDATE_AVAILABLE_EVENT = "sentry:sw:update-available";

export type SwUpdateAvailableDetail = {
    registration: ServiceWorkerRegistration;
    version: string;
};

let pendingReload = false;
let controllerListenerBound = false;
let reloadTimeoutId: number | null = null;
const RELOAD_FALLBACK_DELAY_MS = 2000;

type ReloadHandler = () => void;

const defaultReloadHandler: ReloadHandler = () => {
    window.location.reload();
};

let reloadHandler: ReloadHandler = defaultReloadHandler;

export const __setReloadHandlerForTests = (handler: ReloadHandler | null) => {
    reloadHandler = handler ?? defaultReloadHandler;
};

const requestReload = () => {
    try {
        reloadHandler();
    } catch {
        // ignore
    }
};

const bindControllerChangeReload = () => {
    if (
        controllerListenerBound
        || typeof navigator === "undefined"
        || !("serviceWorker" in navigator)
        || typeof navigator.serviceWorker?.addEventListener !== "function"
    ) {
        return;
    }
    controllerListenerBound = true;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!pendingReload) {
            return;
        }
        pendingReload = false;
        if (reloadTimeoutId !== null) {
            window.clearTimeout(reloadTimeoutId);
            reloadTimeoutId = null;
        }
        requestReload();
    });
};

export const listenForSwUpdateAvailable = (handler: (detail: SwUpdateAvailableDetail) => void) => {
    const listener = (event: Event) => {
        const detail = (event as CustomEvent<SwUpdateAvailableDetail>).detail;
        if (!detail?.registration) {
            return;
        }
        handler(detail);
    };
    window.addEventListener(SW_UPDATE_AVAILABLE_EVENT, listener);
    return () => window.removeEventListener(SW_UPDATE_AVAILABLE_EVENT, listener);
};

const dispatchSwUpdateAvailable = (detail: SwUpdateAvailableDetail) => {
    window.dispatchEvent(new CustomEvent<SwUpdateAvailableDetail>(SW_UPDATE_AVAILABLE_EVENT, { detail }));
};

export const activateWaitingServiceWorker = (registration: ServiceWorkerRegistration | null): boolean => {
    bindControllerChangeReload();
    pendingReload = true;
    if (reloadTimeoutId !== null) {
        window.clearTimeout(reloadTimeoutId);
    }
    reloadTimeoutId = window.setTimeout(() => {
        if (!pendingReload) {
            return;
        }
        pendingReload = false;
        reloadTimeoutId = null;
        requestReload();
    }, RELOAD_FALLBACK_DELAY_MS);

    if (!registration) {
        return false;
    }

    if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        return true;
    }

    // If the worker is already activated (or we no longer have a waiting reference),
    // a plain reload is still the best-effort way to fetch the latest assets.
    requestReload();
    return true;
};

const scheduleUpdateChecks = (registration: ServiceWorkerRegistration) => {
    const update = () => registration.update().catch(() => undefined);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            update();
        }
    });
    window.addEventListener("online", () => {
        update();
    });
    window.setInterval(update, 60 * 60 * 1000);
};

export const registerServiceWorker = async (version: string) => {
    const registration = await navigator.serviceWorker.register(`/sw.js?v=${version}`);

    scheduleUpdateChecks(registration);

    const notifyIfWaiting = () => {
        if (registration.waiting && navigator.serviceWorker.controller) {
            dispatchSwUpdateAvailable({ registration, version });
        }
    };

    notifyIfWaiting();

    registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) {
            return;
        }
        worker.addEventListener("statechange", () => {
            if (worker.state === "installed") {
                notifyIfWaiting();
            }
        });
    });

    return registration;
};
