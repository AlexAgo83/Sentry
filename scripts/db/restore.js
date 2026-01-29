#!/usr/bin/env node
const {
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
    const args = parseArgs(process.argv.slice(2), { dumpFile: true });
    const rawUrl = resolveDatabaseUrl(args.target);
    const url = parseDatabaseUrl(rawUrl);
    assertSchema(url);
    assertDumpFile(args.dumpFile);

    const env = buildEnv(args.target);
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
