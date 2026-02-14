import { describe, expect, it, vi } from "vitest";

describe("pwa service worker helpers", () => {
    it("listenForSwUpdateAvailable wires and unwires handlers", async () => {
        vi.resetModules();

        const { SW_UPDATE_AVAILABLE_EVENT, listenForSwUpdateAvailable } = await import("../../src/pwa/serviceWorker");

        const handler = vi.fn();
        const unlisten = listenForSwUpdateAvailable(handler);

        const detail = { registration: {} as ServiceWorkerRegistration, version: "1.0.0" };
        window.dispatchEvent(new CustomEvent(SW_UPDATE_AVAILABLE_EVENT, { detail }));
        expect(handler).toHaveBeenCalledWith(detail);

        unlisten();
        window.dispatchEvent(new CustomEvent(SW_UPDATE_AVAILABLE_EVENT, { detail }));
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("registerServiceWorker registers a versioned service worker and dispatches update events when waiting", async () => {
        vi.useFakeTimers();
        vi.resetModules();

        const update = vi.fn().mockResolvedValue(undefined);
        const registration = {
            waiting: { postMessage: vi.fn() },
            installing: null,
            update,
            addEventListener: vi.fn()
        } as unknown as ServiceWorkerRegistration;

        const controller = {} as ServiceWorker;
        const swContainer = {
            controller,
            register: vi.fn().mockResolvedValue(registration),
            addEventListener: vi.fn()
        } as unknown as ServiceWorkerContainer;

        Object.defineProperty(navigator, "serviceWorker", { value: swContainer, configurable: true });

        const { SW_UPDATE_AVAILABLE_EVENT, registerServiceWorker } = await import("../../src/pwa/serviceWorker");

        const onUpdate = vi.fn();
        window.addEventListener(SW_UPDATE_AVAILABLE_EVENT, onUpdate as unknown as (event: Event) => void);

        await registerServiceWorker("1.2.3");

        expect(swContainer.register).toHaveBeenCalledWith("/sw.js?v=1.2.3");
        expect(onUpdate).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it("activateWaitingServiceWorker posts a skip-waiting message and reloads on controllerchange", async () => {
        vi.resetModules();
        vi.useFakeTimers();

        const waiting = { postMessage: vi.fn() };
        const registration = { waiting } as unknown as ServiceWorkerRegistration;

        const controllerChangeListeners: Array<() => void> = [];
        const swContainer = {
            addEventListener: (event: string, handler: () => void) => {
                if (event === "controllerchange") {
                    controllerChangeListeners.push(handler);
                }
            }
        } as unknown as ServiceWorkerContainer;

        Object.defineProperty(navigator, "serviceWorker", { value: swContainer, configurable: true });

        const { __setReloadHandlerForTests, activateWaitingServiceWorker } = await import("../../src/pwa/serviceWorker");
        const reloadSpy = vi.fn();
        __setReloadHandlerForTests(reloadSpy);

        const activated = activateWaitingServiceWorker(registration);
        expect(activated).toBe(true);
        expect(waiting.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });

        expect(controllerChangeListeners.length).toBe(1);

        controllerChangeListeners[0]?.();
        expect(reloadSpy).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it("activateWaitingServiceWorker falls back to a timed reload when controllerchange does not fire", async () => {
        vi.resetModules();
        vi.useFakeTimers();

        const waiting = { postMessage: vi.fn() };
        const registration = { waiting } as unknown as ServiceWorkerRegistration;

        const swContainer = {
            addEventListener: vi.fn()
        } as unknown as ServiceWorkerContainer;

        Object.defineProperty(navigator, "serviceWorker", { value: swContainer, configurable: true });

        const { __setReloadHandlerForTests, activateWaitingServiceWorker } = await import("../../src/pwa/serviceWorker");
        const reloadSpy = vi.fn();
        __setReloadHandlerForTests(reloadSpy);

        expect(activateWaitingServiceWorker(registration)).toBe(true);
        vi.advanceTimersByTime(2000);
        expect(reloadSpy).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it("activateWaitingServiceWorker reloads immediately when no waiting worker exists", async () => {
        vi.resetModules();
        vi.useFakeTimers();

        const registration = { waiting: null } as unknown as ServiceWorkerRegistration;
        const swContainer = {
            addEventListener: vi.fn()
        } as unknown as ServiceWorkerContainer;

        Object.defineProperty(navigator, "serviceWorker", { value: swContainer, configurable: true });

        const { __setReloadHandlerForTests, activateWaitingServiceWorker } = await import("../../src/pwa/serviceWorker");
        const reloadSpy = vi.fn();
        __setReloadHandlerForTests(reloadSpy);

        expect(activateWaitingServiceWorker(registration)).toBe(true);
        expect(reloadSpy).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it("registerServiceWorker dispatches update events after an update is installed", async () => {
        vi.useFakeTimers();
        vi.resetModules();

        const update = vi.fn().mockResolvedValue(undefined);
        const registrationListeners: Record<string, (event?: unknown) => void> = {};
        const registration = {
            waiting: null,
            installing: null,
            update,
            addEventListener: (event: string, handler: (event?: unknown) => void) => {
                registrationListeners[event] = handler;
            }
        } as unknown as ServiceWorkerRegistration;

        const controller = {} as ServiceWorker;
        const swContainer = {
            controller,
            register: vi.fn().mockResolvedValue(registration),
            addEventListener: vi.fn()
        } as unknown as ServiceWorkerContainer;

        Object.defineProperty(navigator, "serviceWorker", { value: swContainer, configurable: true });

        const { SW_UPDATE_AVAILABLE_EVENT, registerServiceWorker } = await import("../../src/pwa/serviceWorker");

        const onUpdate = vi.fn();
        window.addEventListener(SW_UPDATE_AVAILABLE_EVENT, onUpdate as unknown as (event: Event) => void);

        await registerServiceWorker("1.2.3");

        const installingListeners: Record<string, () => void> = {};
        const installing = {
            state: "installing",
            addEventListener: (event: string, handler: () => void) => {
                installingListeners[event] = handler;
            }
        } as unknown as ServiceWorker;

        (registration as unknown as { installing: ServiceWorker | null }).installing = installing;

        registrationListeners.updatefound?.();

        (registration as unknown as { waiting: unknown }).waiting = { postMessage: vi.fn() };
        (installing as unknown as { state: string }).state = "installed";
        installingListeners.statechange?.();

        expect(onUpdate).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it("registerServiceWorker schedules update checks (visibility + online + interval)", async () => {
        vi.useFakeTimers();
        vi.resetModules();

        const update = vi.fn().mockResolvedValue(undefined);
        const registration = {
            waiting: null,
            installing: null,
            update,
            addEventListener: vi.fn()
        } as unknown as ServiceWorkerRegistration;

        const swContainer = {
            controller: {} as ServiceWorker,
            register: vi.fn().mockResolvedValue(registration),
            addEventListener: vi.fn()
        } as unknown as ServiceWorkerContainer;

        Object.defineProperty(navigator, "serviceWorker", { value: swContainer, configurable: true });

        const { registerServiceWorker } = await import("../../src/pwa/serviceWorker");

        await registerServiceWorker("1.2.3");

        Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
        window.dispatchEvent(new Event("online"));

        vi.advanceTimersByTime(60 * 60 * 1000);

        expect(update).toHaveBeenCalledTimes(3);

        vi.useRealTimers();
    });
});
