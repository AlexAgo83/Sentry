import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",
    timeout: 60_000,
    expect: {
        timeout: 10_000
    },
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    use: {
        baseURL: "http://127.0.0.1:5173",
        testIdAttribute: "data-testid",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        serviceWorkers: "block"
    },
    webServer: {
        command: "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",
        url: "http://127.0.0.1:5173",
        reuseExistingServer: !process.env.CI,
        env: {
            VITE_E2E: "true",
            VITE_API_BASE: "http://127.0.0.1:4177"
        }
    }
});
