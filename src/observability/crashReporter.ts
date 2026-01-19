export type CrashReport = {
    id: string;
    timestamp: number;
    kind: "error" | "unhandledrejection" | "react";
    message: string;
    stack?: string;
    url?: string;
    appVersion?: string;
};

const STORAGE_KEY = "sentry.crashReports";
const MAX_REPORTS = 10;
const UPDATED_EVENT = "sentry:crashReportsUpdated";
let globalHandlersInstalled = false;
let currentAppVersion: string | undefined;
let globalUninstall: (() => void) | null = null;

const safeJsonParse = (raw: string): unknown => {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const getNow = () => Date.now();

const buildId = () => `${getNow()}-${Math.random().toString(16).slice(2)}`;

export const readCrashReports = (): CrashReport[] => {
    if (typeof window === "undefined") {
        return [];
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = safeJsonParse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter((entry): entry is CrashReport => Boolean(entry && typeof entry === "object"));
    } catch {
        return [];
    }
};

const writeCrashReports = (reports: CrashReport[]) => {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, MAX_REPORTS)));
        window.dispatchEvent(new Event(UPDATED_EVENT));
    } catch {
        // ignore
    }
};

export const clearCrashReports = () => {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event(UPDATED_EVENT));
    } catch {
        // ignore
    }
};

export const recordCrashReport = (report: Omit<CrashReport, "id" | "timestamp">) => {
    const entry: CrashReport = {
        id: buildId(),
        timestamp: getNow(),
        ...report
    };
    const existing = readCrashReports();
    writeCrashReports([entry, ...existing]);
};

export const onCrashReportsUpdated = (handler: () => void) => {
    if (typeof window === "undefined") {
        return () => undefined;
    }
    window.addEventListener(UPDATED_EVENT, handler);
    return () => window.removeEventListener(UPDATED_EVENT, handler);
};

const getErrorStack = (value: unknown): string | undefined => {
    if (value && typeof value === "object" && "stack" in value) {
        const stack = (value as { stack?: unknown }).stack;
        if (typeof stack === "string") {
            return stack;
        }
    }
    return undefined;
};

const getErrorMessage = (value: unknown): string => {
    if (value && typeof value === "object" && "message" in value) {
        const message = (value as { message?: unknown }).message;
        if (typeof message === "string" && message.trim().length > 0) {
            return message;
        }
    }
    if (typeof value === "string") {
        return value;
    }
    return "Unknown error";
};

export const installGlobalCrashHandlers = (options: { appVersion?: string } = {}) => {
    if (typeof window === "undefined") {
        return () => undefined;
    }

    currentAppVersion = options.appVersion;

    if (globalHandlersInstalled) {
        return globalUninstall ?? (() => undefined);
    }

    const onError = (event: ErrorEvent) => {
        recordCrashReport({
            kind: "error",
            message: event.message || "Unhandled error",
            stack: event.error ? getErrorStack(event.error) : undefined,
            url: event.filename,
            appVersion: currentAppVersion
        });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
        recordCrashReport({
            kind: "unhandledrejection",
            message: getErrorMessage(event.reason),
            stack: getErrorStack(event.reason),
            appVersion: currentAppVersion
        });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    globalHandlersInstalled = true;
    globalUninstall = () => {
        window.removeEventListener("error", onError);
        window.removeEventListener("unhandledrejection", onUnhandledRejection);
        globalHandlersInstalled = false;
        globalUninstall = null;
    };

    return globalUninstall;
};
