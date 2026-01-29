const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SCHEMA_NAME = "sentry";
const VALID_TARGETS = new Set(["local", "render"]);

const parseArgs = (argv, options = {}) => {
    const args = {
        target: "local",
        dryRun: false,
        sql: false,
        force: false,
        confirm: false,
        dumpFile: null
    };
    const allow = {
        dumpFile: Boolean(options.dumpFile),
        force: Boolean(options.force),
        sql: Boolean(options.sql),
        confirm: Boolean(options.confirm)
    };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === "--dry-run") {
            args.dryRun = true;
            continue;
        }
        if (arg === "--sql") {
            if (!allow.sql) {
                throw new Error("--sql is not supported for this command.");
            }
            args.sql = true;
            continue;
        }
        if (arg === "--force") {
            if (!allow.force) {
                throw new Error("--force is not supported for this command.");
            }
            args.force = true;
            continue;
        }
        if (arg === "--confirm") {
            if (!allow.confirm) {
                throw new Error("--confirm is not supported for this command.");
            }
            args.confirm = true;
            continue;
        }
        if (arg.startsWith("--target=")) {
            args.target = arg.split("=")[1] ?? "";
            continue;
        }
        if (arg === "--target") {
            args.target = argv[i + 1] ?? "";
            i += 1;
            continue;
        }
        if (arg.startsWith("--dump-file=")) {
            if (!allow.dumpFile) {
                throw new Error("--dump-file is not supported for this command.");
            }
            args.dumpFile = arg.split("=")[1] ?? "";
            continue;
        }
        if (arg === "--dump-file") {
            if (!allow.dumpFile) {
                throw new Error("--dump-file is not supported for this command.");
            }
            args.dumpFile = argv[i + 1] ?? "";
            i += 1;
            continue;
        }
        throw new Error(`Unknown argument: ${arg}`);
    }

    if (!VALID_TARGETS.has(args.target)) {
        throw new Error(`Unsupported --target value: ${args.target}`);
    }

    return args;
};

const resolveDatabaseUrl = (target) => {
    const env = process.env;
    const url = target === "render"
        ? env.DATABASE_URL_RENDER || env.DATABASE_URL
        : env.DATABASE_URL_LOCAL || env.DATABASE_URL;
    if (!url) {
        throw new Error(`Missing database URL for target: ${target}`);
    }
    return url;
};

const parseDatabaseUrl = (rawUrl) => {
    try {
        return new URL(rawUrl);
    } catch {
        throw new Error("Invalid DATABASE_URL format.");
    }
};

const assertSchema = (url) => {
    const schema = url.searchParams.get("schema");
    if (!schema) {
        throw new Error("DATABASE_URL must include ?schema=sentry.");
    }
    if (schema === "public") {
        throw new Error("schema=public is not allowed.");
    }
    if (schema !== SCHEMA_NAME) {
        throw new Error(`Invalid schema. Expected ${SCHEMA_NAME}.`);
    }
};

const buildEnv = (target) => {
    const env = { ...process.env };
    if (target === "render") {
        if (env.PGSSL_DISABLE === "1") {
            throw new Error("PGSSL_DISABLE is not allowed for render targets.");
        }
        env.PGSSLMODE = "require";
    } else if (env.PGSSL_DISABLE === "1") {
        env.PGSSLMODE = "disable";
    }
    return env;
};

const redactDatabaseUrl = (rawUrl) => {
    try {
        const url = new URL(rawUrl);
        if (url.password) {
            url.password = "***";
        }
        return url.toString();
    } catch {
        return "<invalid-url>";
    }
};

const runCommand = ({ command, args, env, dryRun, urlToRedact }) => {
    const safeArgs = urlToRedact
        ? args.map((arg) => (arg === urlToRedact ? redactDatabaseUrl(urlToRedact) : arg))
        : args;
    console.info(`[db] ${command} ${safeArgs.join(" ")}`);
    if (dryRun) {
        return;
    }
    const result = spawnSync(command, args, { stdio: "inherit", env });
    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
};

const ensureDumpDir = () => {
    const dir = path.join(__dirname, "dumps");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
};

const formatTimestamp = (date = new Date()) => {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const assertDumpFile = (dumpFile) => {
    if (!dumpFile) {
        throw new Error("--dump-file is required.");
    }
    if (!fs.existsSync(dumpFile)) {
        throw new Error(`Dump file not found: ${dumpFile}`);
    }
};

const isSqlDump = (dumpFile) => dumpFile.toLowerCase().endsWith(".sql");

module.exports = {
    SCHEMA_NAME,
    parseArgs,
    resolveDatabaseUrl,
    parseDatabaseUrl,
    assertSchema,
    buildEnv,
    runCommand,
    ensureDumpDir,
    formatTimestamp,
    assertDumpFile,
    isSqlDump,
    redactDatabaseUrl
};
