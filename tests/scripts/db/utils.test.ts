// @vitest-environment node
import { describe, expect, it } from "vitest";

type DbUtils = {
    parseArgs: (argv: string[], options?: { dumpFile?: boolean; force?: boolean; sql?: boolean; confirm?: boolean }) => {
        target: string;
        dryRun: boolean;
        sql: boolean;
        force: boolean;
        confirm: boolean;
        dumpFile: string | null;
    };
    parseDatabaseUrl: (url: string) => { url: URL; schema: string | null; database: string | null };
    assertSchema: (parsed: { schema: string | null }) => void;
};

const loadUtils = async (): Promise<DbUtils> => {
    const mod = await import("../../../scripts/db/utils.js");
    return mod as unknown as DbUtils;
};

describe("db utils", () => {
    it("parses args with target and dry-run", async () => {
        const utils = await loadUtils();
        const args = utils.parseArgs(["--target=render", "--dry-run"], {
            dumpFile: true,
            force: true,
            sql: true,
            confirm: true
        });
        expect(args.target).toBe("render");
        expect(args.dryRun).toBe(true);
    });

    it("rejects missing schema or public schema", async () => {
        const utils = await loadUtils();
        const missing = utils.parseDatabaseUrl("postgresql://user:pass@localhost:5432/db");
        expect(() => utils.assertSchema(missing)).toThrow();

        const publicSchema = utils.parseDatabaseUrl("postgresql://user:pass@localhost:5432/db?schema=public");
        expect(() => utils.assertSchema(publicSchema)).toThrow();
    });

    it("accepts the sentry schema", async () => {
        const utils = await loadUtils();
        const sentrySchema = utils.parseDatabaseUrl("postgresql://user:pass@localhost:5432/db?schema=sentry");
        expect(() => utils.assertSchema(sentrySchema)).not.toThrow();
    });
});
