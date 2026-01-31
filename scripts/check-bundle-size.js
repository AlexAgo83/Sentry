const fs = require("fs");
const path = require("path");

const budgetsPath = path.join(__dirname, "bundle-budgets.json");
const budgets = JSON.parse(fs.readFileSync(budgetsPath, "utf-8"));

const distDir = path.join(__dirname, "..", "dist", "assets");
if (!fs.existsSync(distDir)) {
    console.error("Bundle check failed: dist/assets not found. Run build first.");
    process.exit(1);
}

const entries = fs.readdirSync(distDir)
    .filter((file) => file.endsWith(".js") || file.endsWith(".css"))
    .map((file) => {
        const fullPath = path.join(distDir, file);
        const stats = fs.statSync(fullPath);
        return { file, size: stats.size };
    });

const totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);
const jsEntries = entries.filter((entry) => entry.file.endsWith(".js"));
const cssEntries = entries.filter((entry) => entry.file.endsWith(".css"));

const maxJsBytes = jsEntries.length
    ? Math.max(...jsEntries.map((entry) => entry.size))
    : 0;
const maxCssBytes = cssEntries.length
    ? Math.max(...cssEntries.map((entry) => entry.size))
    : 0;

const failures = [];
const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10;

if (typeof budgets.maxJsKb === "number" && maxJsBytes > budgets.maxJsKb * 1024) {
    failures.push(`JS chunk max ${kb(maxJsBytes)}KB exceeds ${budgets.maxJsKb}KB`);
}

if (typeof budgets.maxCssKb === "number" && maxCssBytes > budgets.maxCssKb * 1024) {
    failures.push(`CSS chunk max ${kb(maxCssBytes)}KB exceeds ${budgets.maxCssKb}KB`);
}

if (typeof budgets.maxTotalKb === "number" && totalBytes > budgets.maxTotalKb * 1024) {
    failures.push(`Total assets ${kb(totalBytes)}KB exceeds ${budgets.maxTotalKb}KB`);
}

console.info("Bundle size summary:");
entries.forEach((entry) => {
    console.info(`- ${entry.file}: ${kb(entry.size)}KB`);
});
console.info(`- Total: ${kb(totalBytes)}KB`);

if (failures.length > 0) {
    console.error("Bundle size budget exceeded:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
}

console.info("Bundle size within budget.");
