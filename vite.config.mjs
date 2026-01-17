import { defineConfig, configDefaults } from "vitest/config";
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
    },
    test: {
        environment: "jsdom",
        setupFiles: ["tests/setup.ts"],
        coverage: {
            include: ["src/**", "public/sw.js"],
            exclude: ["**/*.d.ts"],
            thresholds: {
                lines: 90,
                branches: 75,
                functions: 90,
                statements: 90
            }
        },
        exclude: [
            ...configDefaults.exclude,
            "tests/build.test.ts"
        ]
    }
});
