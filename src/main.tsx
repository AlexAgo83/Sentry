import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import { App } from "./app/App";
import { registerServiceWorker } from "./pwa/serviceWorker";
import { ErrorBoundary } from "./app/components/ErrorBoundary";
import { installGlobalCrashHandlers } from "./observability/crashReporter";

declare const __APP_VERSION__: string;

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found.");
}

const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
installGlobalCrashHandlers({ appVersion: version });

createRoot(rootElement).render(
    <React.StrictMode>
        <ErrorBoundary appVersion={version}>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        if (import.meta.env.PROD) {
            registerServiceWorker(version).catch((error) => {
                console.error("Service worker registration failed", error);
            });
            return;
        }

        // Keep Vite HMR stable in local dev by removing any previously installed SW.
        if (typeof navigator.serviceWorker.getRegistrations === "function") {
            navigator.serviceWorker.getRegistrations()
                .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
                .catch(() => undefined);
            return;
        }

        // Fallback for test-like environments that expose `serviceWorker` but not `getRegistrations`.
        registerServiceWorker(version).catch((error) => {
            console.error("Service worker registration failed", error);
        });
    });
}
