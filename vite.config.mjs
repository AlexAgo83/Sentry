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
        // Keep runs short and fail fast to avoid hanging suites locally.
        testTimeout: 10000,
        hookTimeout: 10000,
        teardownTimeout: 10000,
        bail: 1,
        pool: "threads",
        poolOptions: {
            threads: {
                singleThread: true
            }
        },
        sequence: {
            concurrent: false
        },
        onConsoleLog(log, type) {
            // Surface all console output with a prefix for easier debugging of slow tests.
            // Return false so Vitest still prints the original message.
            console.info(`[vitest:${type}] ${log}`);
            return false;
        },
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
