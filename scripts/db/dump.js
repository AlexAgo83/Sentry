#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
    parseArgs,
    resolveDatabaseUrl,
    parseDatabaseUrl,
    assertSchema,
    buildEnv,
    runCommand,
    ensureDumpDir,
    formatTimestamp
} = require("./utils");

const main = () => {
    const args = parseArgs(process.argv.slice(2), { sql: true, force: true });
    const rawUrl = resolveDatabaseUrl(args.target);
    const url = parseDatabaseUrl(rawUrl);
    assertSchema(url);

    const dumpsDir = ensureDumpDir();
    const timestamp = formatTimestamp();
    const baseName = `db_dump_${args.target}_${timestamp}`;
    const dumpPath = path.join(dumpsDir, `${baseName}.dump`);
    if (fs.existsSync(dumpPath) && !args.force) {
        throw new Error(`Dump file already exists: ${dumpPath}`);
    }

    const env = buildEnv(args.target);
    const commonArgs = [
        "--no-owner",
        "--no-privileges",
        "--data-only",
        "--dbname",
        rawUrl
    ];
    const dumpArgs = [
        "--format=custom",
        "-Z",
        "6",
        "--file",
        dumpPath,
        ...commonArgs
    ];

    runCommand({
        command: "pg_dump",
        args: dumpArgs,
        env,
        dryRun: args.dryRun,
        urlToRedact: rawUrl
    });

    if (args.sql) {
        const sqlPath = path.join(dumpsDir, `${baseName}.sql`);
        if (fs.existsSync(sqlPath) && !args.force) {
            throw new Error(`SQL dump already exists: ${sqlPath}`);
        }
        const sqlArgs = [
            "--format=plain",
            "--file",
            sqlPath,
            ...commonArgs
        ];
        runCommand({
            command: "pg_dump",
            args: sqlArgs,
            env,
            dryRun: args.dryRun,
            urlToRedact: rawUrl
        });
    }
};

try {
    main();
} catch (error) {
    console.error(`[db] ${error.message}`);
    process.exit(1);
}
