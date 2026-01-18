#!/usr/bin/env node
const { spawn } = require("node:child_process");

const isCi = process.env.CI === "true";
const timeoutMsEnv = process.env.TEST_TIMEOUT_MS;
const timeoutMs = timeoutMsEnv !== undefined
    ? Number(timeoutMsEnv)
    : isCi
        ? null
        : 90000;
const userArgs = process.argv.slice(2);

const child = spawn("npx", ["vitest", "run", ...userArgs], {
    stdio: "inherit",
    shell: true
});

const timeout = timeoutMs && Number.isFinite(timeoutMs)
    ? setTimeout(() => {
        console.error(`[tests] Timed out after ${timeoutMs}ms. Killing vitest...`);
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 2000);
    }, timeoutMs)
    : null;

child.on("exit", (code, signal) => {
    if (timeout) {
        clearTimeout(timeout);
    }
    if (signal === "SIGTERM" || signal === "SIGKILL") {
        process.exit(124);
    }
    process.exit(code ?? 1);
});
