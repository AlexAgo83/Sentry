#!/usr/bin/env node
const {
    SCHEMA_NAME,
    parseArgs,
    resolveDatabaseUrl,
    parseDatabaseUrl,
    assertSchema,
    buildEnv,
    runCommand,
    assertDumpFile,
    isSqlDump
} = require("./utils");

const main = () => {
    const args = parseArgs(process.argv.slice(2), { dumpFile: true, confirm: true });
    if (!args.confirm) {
        throw new Error("--confirm is required to reset a database.");
    }
    if (args.target === "render" && process.env.SCHEMA_RESET_FORCE !== "1") {
        throw new Error("SCHEMA_RESET_FORCE=1 is required for render resets.");
    }

    const rawUrl = resolveDatabaseUrl(args.target);
    const url = parseDatabaseUrl(rawUrl);
    assertSchema(url);
    assertDumpFile(args.dumpFile);

    const env = buildEnv(args.target);

    runCommand({
        command: "psql",
        args: [
            "--dbname",
            rawUrl,
            "--command",
            `DROP SCHEMA IF EXISTS ${SCHEMA_NAME} CASCADE; CREATE SCHEMA ${SCHEMA_NAME};`
        ],
        env,
        dryRun: args.dryRun,
        urlToRedact: rawUrl
    });

    if (isSqlDump(args.dumpFile)) {
        runCommand({
            command: "psql",
            args: ["--dbname", rawUrl, "--file", args.dumpFile],
            env,
            dryRun: args.dryRun,
            urlToRedact: rawUrl
        });
        return;
    }

    runCommand({
        command: "pg_restore",
        args: [
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-privileges",
            "--dbname",
            rawUrl,
            args.dumpFile
        ],
        env,
        dryRun: args.dryRun,
        urlToRedact: rawUrl
    });
};

try {
    main();
} catch (error) {
    console.error(`[db] ${error.message}`);
    process.exit(1);
}
