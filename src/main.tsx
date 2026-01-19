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
        registerServiceWorker(version).catch((error) => {
            console.error("Service worker registration failed", error);
        });
    });
}
