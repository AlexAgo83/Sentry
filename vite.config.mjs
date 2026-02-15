import { defineConfig, configDefaults } from "vitest/config";
import { loadEnv } from "vite";
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";

/// <reference types="vitest/config" />
const pkg = JSON.parse(
    readFileSync(new URL("./package.json", import.meta.url), "utf-8")
);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const prodRenderApiBase = env.PROD_RENDER_API_BASE ?? "";

    return {
        define: {
            __APP_VERSION__: JSON.stringify(pkg.version),
            __ASSETS_PATH__: JSON.stringify("/img/"),
            __PROD_RENDER_API_BASE__: JSON.stringify(prodRenderApiBase)
        },
        plugins: [react()],
        build: {
            outDir: "dist",
            manifest: true,
            rollupOptions: {
                input: [
                    "./index.html"
                ],
                output: {
                    manualChunks(id) {
                        if (id.includes("/node_modules/pixi.js/") || id.includes("/node_modules/@pixi/")) {
                            return "pixi";
                        }
                        if (id.includes("node_modules")) {
                            return "vendor";
                        }
                        if (id.includes("/src/core/")) {
                            return "core";
                        }
                        return undefined;
                    }
                },
                plugins: [
                    visualizer({
                        filename: "dist/bundle-report.html",
                        template: "treemap",
                        gzipSize: true,
                        brotliSize: true
                    })
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
                        lines: 75,
                        branches: 75,
                        functions: 75,
                        statements: 75
                    }
                },
                exclude: [
                    ...configDefaults.exclude,
                    "tests/build.test.ts",
                    "tests/e2e/**",
                    "src/core/types.ts",
                    "src/core/index.ts"
                ]
            };
        })()
    };
});
