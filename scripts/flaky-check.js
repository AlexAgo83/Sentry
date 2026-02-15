const { spawnSync } = require("child_process");

const repeat = Number.parseInt(process.env.FLAKY_REPEAT ?? "5", 10);
const pattern = String(process.env.FLAKY_TEST ?? "tests/adapters/persistence/saveEnvelope.test.ts");

if (!Number.isFinite(repeat) || repeat < 1) {
    console.error("flaky-check: FLAKY_REPEAT must be a positive integer.");
    process.exit(2);
}

console.info(`flaky-check: running ${pattern} x${repeat}`);

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

for (let i = 1; i <= repeat; i += 1) {
    console.info(`flaky-check: iteration ${i}/${repeat}`);
    const result = spawnSync(
        npmCmd,
        ["run", "test:ci", "--", pattern],
        {
            stdio: "inherit",
            env: {
                ...process.env,
                // Keep vitest strict behavior consistent across runs.
                VITEST_STRICT: process.env.VITEST_STRICT ?? "true"
            }
        }
    );

    if (result.status !== 0) {
        console.error(`flaky-check: failed on iteration ${i}/${repeat}`);
        process.exit(result.status ?? 1);
    }
}

console.info("flaky-check: passed");

