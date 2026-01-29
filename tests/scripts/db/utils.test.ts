// @vitest-environment node
import { describe, expect, it } from "vitest";

const utils = require("../../../scripts/db/utils.js");

describe("db utils", () => {
    it("parses args with target and dry-run", () => {
        const args = utils.parseArgs(["--target=render", "--dry-run"], {
            dumpFile: true,
            force: true,
            sql: true,
            confirm: true
        });
        expect(args.target).toBe("render");
        expect(args.dryRun).toBe(true);
    });

    it("rejects missing schema or public schema", () => {
        const missing = utils.parseDatabaseUrl("postgresql://user:pass@localhost:5432/db");
        expect(() => utils.assertSchema(missing)).toThrow();

        const publicSchema = utils.parseDatabaseUrl("postgresql://user:pass@localhost:5432/db?schema=public");
        expect(() => utils.assertSchema(publicSchema)).toThrow();
    });

    it("accepts the sentry schema", () => {
        const sentrySchema = utils.parseDatabaseUrl("postgresql://user:pass@localhost:5432/db?schema=sentry");
        expect(() => utils.assertSchema(sentrySchema)).not.toThrow();
    });
});
