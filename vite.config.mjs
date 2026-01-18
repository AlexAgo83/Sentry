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
    test: (() => {
        const isCi = process.env.CI === "true";
        const strictDefault = !isCi;
        const strict = process.env.VITEST_STRICT === "true"
            ? true
            : process.env.VITEST_STRICT === "false"
                ? false
                : strictDefault;
        const logConsoles = process.env.VITEST_LOG_CONSOLE === "true";

        return {
            environment: "jsdom",
            setupFiles: ["tests/setup.ts"],
            testTimeout: 10000,
            hookTimeout: 10000,
            teardownTimeout: 10000,
            bail: strict ? 1 : 0,
            pool: "threads",
            poolOptions: {
                threads: {
                    singleThread: strict
                }
            },
            sequence: {
                concurrent: false
            },
            onConsoleLog: logConsoles
                ? (log, type) => {
                    console.info(`[vitest:${type}] ${log}`);
                    return false;
                }
                : undefined,
            coverage: {
                include: ["src/**", "public/sw.js"],
                exclude: [
                    "**/*.d.ts",
                    "src/core/types.ts",
                    "src/core/index.ts",
                    "**/src/core/types.ts",
                    "**/src/core/index.ts"
                ],
                thresholds: {
                    lines: 90,
                    branches: 75,
                    functions: 89,
                    statements: 90
                }
            },
            exclude: [
                ...configDefaults.exclude,
                "tests/build.test.ts",
                "src/core/types.ts",
                "src/core/index.ts"
            ]
        };
    })()
});
