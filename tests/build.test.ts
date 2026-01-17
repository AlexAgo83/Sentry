// @vitest-environment node
import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";

describe("Build", () => {
    it(
        "builds with Vite",
        { timeout: 60000 },
        () => {
            expect(() => execSync("npm run build", { stdio: "pipe" })).not.toThrow();
        }
    );
});
