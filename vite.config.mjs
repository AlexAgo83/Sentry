import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react-swc";

/// <reference types="vitest/config" />
const pkg = JSON.parse(
    readFileSync(new URL("./package.json", import.meta.url), "utf-8")
);

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
        __ASSETS_PATH__: JSON.stringify("/img/")
    },
    plugins: [react()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: [
                './index.html'
            ]
        }
    }
});
