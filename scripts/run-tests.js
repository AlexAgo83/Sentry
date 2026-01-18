#!/usr/bin/env node
const { spawn } = require("node:child_process");

const timeoutMs = Number(process.env.TEST_TIMEOUT_MS ?? "90000");
const userArgs = process.argv.slice(2);

const child = spawn("npx", ["vitest", "run", ...userArgs], {
    stdio: "inherit",
    shell: true
});

const timeout = setTimeout(() => {
    console.error(`[tests] Timed out after ${timeoutMs}ms. Killing vitest...`);
    child.kill("SIGTERM");
    setTimeout(() => child.kill("SIGKILL"), 2000);
}, timeoutMs);

child.on("exit", (code, signal) => {
    clearTimeout(timeout);
    if (signal === "SIGTERM" || signal === "SIGKILL") {
        process.exit(124);
    }
    process.exit(code ?? 1);
});
