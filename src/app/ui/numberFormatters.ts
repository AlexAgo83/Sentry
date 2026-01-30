export const formatNumberFull = (value: number): string => {
    if (!Number.isFinite(value)) {
        return "0";
    }
    return Math.max(0, Math.floor(value)).toLocaleString();
};

export const formatNumberCompact = (value: number): string => {
    if (!Number.isFinite(value)) {
        return "0";
    }
    const safeValue = Math.max(0, value);
    const units = [
        { threshold: 1e12, suffix: "T" },
        { threshold: 1e9, suffix: "B" },
        { threshold: 1e6, suffix: "M" },
        { threshold: 1e3, suffix: "K" }
    ];
    for (const unit of units) {
        if (safeValue >= unit.threshold) {
            const scaled = safeValue / unit.threshold;
            const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
            const trimmed = scaled.toFixed(decimals).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
            return `${trimmed}${unit.suffix}`;
        }
    }
    return String(Math.round(safeValue));
};
