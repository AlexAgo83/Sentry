import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import { App } from "./app/App";
import { registerServiceWorker } from "./pwa/serviceWorker";

declare const __APP_VERSION__: string;

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found.");
}

createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
        registerServiceWorker(version).catch((error) => {
            console.error("Service worker registration failed", error);
        });
    });
}
