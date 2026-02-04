type CloudAuthResponse = {
    accessToken: string;
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

const ACCESS_TOKEN_KEY = "sentry.cloud.accessToken";
const CSRF_COOKIE_NAME = "refreshCsrf";

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

const buildUrl = (path: string) => {
    const base = getApiBase();
    if (!base) {
        return null;
    }
    return `${base.replace(/\/$/, "")}${path}`;
};

const loadAccessToken = (): string | null => {
    if (typeof localStorage === "undefined") {
        return null;
    }
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const saveAccessToken = (token: string | null) => {
    if (typeof localStorage === "undefined") {
        return;
    }
    if (!token) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        return;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const clearAccessToken = () => saveAccessToken(null);

const loadCsrfToken = (): string | null => {
    if (typeof document === "undefined") {
        return null;
    }
    const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

const requestJson = async <T>(path: string, options: globalThis.RequestInit = {}): Promise<T> => {
    const url = buildUrl(path);
    if (!url) {
        throw new Error("Cloud API base is not configured.");
    }
    const hasBody = options.body !== undefined && options.body !== null;
    const headers = new Headers(options.headers ?? {});
    if (hasBody && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    const response = await fetch(url, {
        credentials: "include",
        ...options,
        headers
    });
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
    saveAccessToken(data.accessToken);
    return data.accessToken;
};

const login = async (email: string, password: string): Promise<string> => {
    const data = await requestJson<CloudAuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
    saveAccessToken(data.accessToken);
    return data.accessToken;
};

const refresh = async (): Promise<string> => {
    const csrfToken = loadCsrfToken();
    const data = await requestJson<CloudAuthResponse>("/api/v1/auth/refresh", {
        method: "POST",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined
    });
    saveAccessToken(data.accessToken);
    return data.accessToken;
};

const getLatestSave = async (accessToken: string | null): Promise<CloudSaveResponse | null> => {
    const url = buildUrl("/api/v1/saves/latest");
    if (!url) {
        throw new Error("Cloud API base is not configured.");
    }
    const response = await fetch(url, {
        credentials: "include",
        headers: authHeaders(accessToken)
    });
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
    });
};

const probeReady = async (): Promise<void> => {
    const url = buildUrl("/api/v1/saves/latest");
    if (!url) {
        throw new Error("Cloud API base is not configured.");
    }
    const response = await fetch(url, {
        credentials: "include"
    });
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
    register,
    login,
    refresh,
    getLatestSave,
    putLatestSave,
    probeReady
};
