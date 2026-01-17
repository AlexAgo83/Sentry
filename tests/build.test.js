import { suite, test, expect } from "vitest";
import { execSync } from "node:child_process";

suite("Build", () => {
    test(
        "builds with Vite",
        { timeout: 60000 },
        () => {
            expect(() => execSync("npm run build", { stdio: "pipe" })).not.toThrow();
        }
    );
});
