type CloudAuthResponse = {
    accessToken: string;
    csrfToken?: string;
};

type CloudSaveMeta = {
    updatedAt: string;
    virtualScore: number;
    appVersion: string;
};

type CloudSaveResponse = {
    payload: unknown;
    meta: CloudSaveMeta;
};

type CloudSaveMetaResponse = {
    meta: CloudSaveMeta;
};

export type CloudProfile = {
    email: string;
    username: string | null;
    maskedEmail: string;
    displayName: string;
};

type CloudProfileResponse = {
    profile: CloudProfile;
};

const LEGACY_ACCESS_TOKEN_KEY = "sentry.cloud.accessToken";
const CSRF_TOKEN_KEY = "sentry.cloud.csrfToken";

export class CloudApiError extends Error {
    status: number;
    body: string;

    constructor(status: number, body: string) {
        super(body || `Request failed (${status}).`);
        this.name = "CloudApiError";
        this.status = status;
        this.body = body;
    }
}

const getApiBase = () => import.meta.env?.VITE_API_BASE ?? "";

// Access tokens must be memory-only (never persisted) to reduce XSS blast radius.
let memoryAccessToken: string | null = null;

const DEFAULT_REQUEST_TIMEOUT_MS = 4000;
const SAVE_WRITE_TIMEOUT_MS = 8000;

const buildUrl = (path: string) => {
    const base = getApiBase();
    if (!base) {
        return null;
    }
    return `${base.replace(/\/$/, "")}${path}`;
};

const loadAccessToken = (): string | null => {
    return memoryAccessToken;
};

const saveAccessToken = (token: string | null) => {
    memoryAccessToken = token;
};

const clearAccessToken = () => {
    saveAccessToken(null);
    // Best-effort cleanup of older persisted tokens (security migration).
    if (typeof localStorage === "undefined") {
        return;
    }
    try {
        localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
    } catch {
        // ignore
    }
};

const loadCsrfToken = (): string | null => {
    if (typeof localStorage === "undefined") {
        return null;
    }
    try {
        return localStorage.getItem(CSRF_TOKEN_KEY);
    } catch {
        return null;
    }
};

const saveCsrfToken = (token: string | null) => {
    if (typeof localStorage === "undefined") {
        return;
    }
    if (!token) {
        localStorage.removeItem(CSRF_TOKEN_KEY);
        return;
    }
    localStorage.setItem(CSRF_TOKEN_KEY, token);
};

const clearCsrfToken = () => saveCsrfToken(null);

const hasStoredCsrfToken = (): boolean => {
    const token = loadCsrfToken();
    return typeof token === "string" && token.trim().length > 0;
};

const persistAuthResponse = (data: CloudAuthResponse) => {
    saveAccessToken(data.accessToken);
    if (typeof data.csrfToken === "string" && data.csrfToken.trim().length > 0) {
        saveCsrfToken(data.csrfToken);
        return;
    }
    clearCsrfToken();
};

// Security migration: remove persisted access tokens from older builds.
clearAccessToken();

const fetchWithTimeout = async (url: string, init: globalThis.RequestInit, timeoutMs: number) => {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller
        ? globalThis.setTimeout(() => controller.abort(), Math.max(0, Math.floor(timeoutMs)))
        : null;

    try {
        return await fetch(url, {
            ...init,
            signal: controller?.signal
        });
    } finally {
        if (timeoutId !== null) {
            globalThis.clearTimeout(timeoutId);
        }
    }
};

const requestJson = async <T>(
    path: string,
    options: globalThis.RequestInit = {},
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS
): Promise<T> => {
    const url = buildUrl(path);
    if (!url) {
        throw new Error("Cloud API base is not configured.");
    }
    const hasBody = options.body !== undefined && options.body !== null;
    const headers = new Headers(options.headers ?? {});
    if (hasBody && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    const response = await fetchWithTimeout(url, {
        credentials: "include",
        ...options,
        headers
    }, timeoutMs);
    if (!response.ok) {
        const message = await response.text();
        throw new CloudApiError(response.status, message);
    }
    if (response.status === 204) {
        return null as T;
    }
    return response.json() as Promise<T>;
};

const authHeaders = (accessToken: string | null): Record<string, string> => {
    if (!accessToken) {
        return {};
    }
    return { Authorization: `Bearer ${accessToken}` };
};

const register = async (email: string, password: string): Promise<string> => {
    const data = await requestJson<CloudAuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
    persistAuthResponse(data);
    return data.accessToken;
};

const login = async (email: string, password: string): Promise<string> => {
    const data = await requestJson<CloudAuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
    persistAuthResponse(data);
    return data.accessToken;
};

const refresh = async (): Promise<string> => {
    const csrfToken = loadCsrfToken();
    const data = await requestJson<CloudAuthResponse>("/api/v1/auth/refresh", {
        method: "POST",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined
    });
    persistAuthResponse(data);
    return data.accessToken;
};

const getLatestSave = async (accessToken: string | null): Promise<CloudSaveResponse | null> => {
    const url = buildUrl("/api/v1/saves/latest");
    if (!url) {
        throw new Error("Cloud API base is not configured.");
    }
    const response = await fetchWithTimeout(url, {
        credentials: "include",
        headers: authHeaders(accessToken)
    }, DEFAULT_REQUEST_TIMEOUT_MS);
    if (response.status === 204) {
        return null;
    }
    if (!response.ok) {
        const message = await response.text();
        throw new CloudApiError(response.status, message);
    }
    return response.json() as Promise<CloudSaveResponse>;
};

const putLatestSave = async (
    accessToken: string | null,
    payload: unknown,
    virtualScore: number,
    appVersion: string
): Promise<CloudSaveMetaResponse> => {
    return requestJson<CloudSaveMetaResponse>("/api/v1/saves/latest", {
        method: "PUT",
        headers: authHeaders(accessToken),
        body: JSON.stringify({ payload, virtualScore, appVersion })
    }, SAVE_WRITE_TIMEOUT_MS);
};

const getProfile = async (accessToken: string | null): Promise<CloudProfile> => {
    const response = await requestJson<CloudProfileResponse>("/api/v1/users/me/profile", {
        method: "GET",
        headers: authHeaders(accessToken)
    });
    return response.profile;
};

const updateProfile = async (
    accessToken: string | null,
    username: string | null
): Promise<CloudProfile> => {
    const response = await requestJson<CloudProfileResponse>("/api/v1/users/me/profile", {
        method: "PATCH",
        headers: authHeaders(accessToken),
        body: JSON.stringify({ username })
    });
    return response.profile;
};

const probeReady = async (): Promise<void> => {
    const url = buildUrl("/api/v1/saves/latest");
    if (!url) {
        throw new Error("Cloud API base is not configured.");
    }
    const response = await fetchWithTimeout(url, {
        credentials: "include"
    }, DEFAULT_REQUEST_TIMEOUT_MS);
    if ([200, 204, 401].includes(response.status)) {
        return;
    }
    const message = await response.text();
    throw new CloudApiError(response.status, message);
};

export const cloudClient = {
    getApiBase,
    loadAccessToken,
    clearAccessToken,
    clearCsrfToken,
    hasStoredCsrfToken,
    register,
    login,
    refresh,
    getLatestSave,
    putLatestSave,
    getProfile,
    updateProfile,
    probeReady
};
