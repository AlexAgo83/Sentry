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

const requestJson = async <T>(path: string, options: globalThis.RequestInit = {}): Promise<T> => {
    const url = buildUrl(path);
    if (!url) {
        throw new Error("Cloud API base is not configured.");
    }
    const response = await fetch(url, {
        credentials: "include",
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {})
        }
    });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed (${response.status}).`);
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
    const data = await requestJson<CloudAuthResponse>("/api/v1/auth/refresh", {
        method: "POST"
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
        throw new Error(message || `Request failed (${response.status}).`);
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

export const cloudClient = {
    getApiBase,
    loadAccessToken,
    register,
    login,
    refresh,
    getLatestSave,
    putLatestSave
};
