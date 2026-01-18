export const SW_UPDATE_AVAILABLE_EVENT = "sentry:sw:update-available";

export type SwUpdateAvailableDetail = {
    registration: ServiceWorkerRegistration;
    version: string;
};

let pendingReload = false;
let controllerListenerBound = false;

const bindControllerChangeReload = () => {
    if (controllerListenerBound || typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
        return;
    }
    controllerListenerBound = true;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!pendingReload) {
            return;
        }
        pendingReload = false;
        try {
            window.location.reload();
        } catch {
            // In practice browsers won't throw here, but some test environments do.
        }
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
    if (!registration?.waiting) {
        return false;
    }
    bindControllerChangeReload();
    pendingReload = true;
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    return true;
};

const scheduleUpdateChecks = (registration: ServiceWorkerRegistration) => {
    const update = () => registration.update().catch(() => undefined);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            update();
        }
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
