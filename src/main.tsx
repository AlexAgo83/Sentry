import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "../styles/global.css";

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
        navigator.serviceWorker.register("/sw.js").catch((error) => {
            console.error("Service worker registration failed", error);
        });
    });
}
