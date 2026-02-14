export type LeaderboardEntry = {
    userId: string;
    displayName: string;
    virtualScore: number;
    updatedAt: string;
    appVersion: string;
    isExAequo: boolean;
};

export type LeaderboardResponse = {
    items: LeaderboardEntry[];
    page: number;
    perPage: number;
    hasNextPage: boolean;
};

type LeaderboardErrorBody = {
    error?: string;
    code?: string;
};

export class LeaderboardApiError extends Error {
    status: number;
    code: string;

    constructor(status: number, message: string, code = "unknown_error") {
        super(message || `Request failed (${status}).`);
        this.name = "LeaderboardApiError";
        this.status = status;
        this.code = code;
    }
}

const getApiBase = () => import.meta.env?.VITE_API_BASE ?? "";

const buildUrl = (path: string): string => {
    const base = getApiBase().trim();
    if (!base) {
        return path;
    }
    return `${base.replace(/\/+$/u, "")}${path}`;
};

const parseErrorResponse = async (response: Response): Promise<LeaderboardApiError> => {
    let body: LeaderboardErrorBody | null = null;
    try {
        body = await response.json() as LeaderboardErrorBody;
    } catch {
        body = null;
    }

    const message = typeof body?.error === "string" && body.error.trim().length > 0
        ? body.error
        : `Request failed (${response.status}).`;
    const code = typeof body?.code === "string" && body.code.trim().length > 0
        ? body.code
        : "unknown_error";

    return new LeaderboardApiError(response.status, message, code);
};

export const leaderboardClient = {
    async getEntries(page: number, perPage = 10): Promise<LeaderboardResponse> {
        const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
        const safePerPage = Number.isFinite(perPage) ? Math.max(1, Math.min(10, Math.floor(perPage))) : 10;
        const query = new URLSearchParams({
            page: String(safePage),
            perPage: String(safePerPage)
        });
        const response = await fetch(buildUrl(`/api/v1/leaderboard?${query.toString()}`), {
            method: "GET",
            credentials: "omit",
            cache: "no-store"
        });
        if (!response.ok) {
            throw await parseErrorResponse(response);
        }
        return response.json() as Promise<LeaderboardResponse>;
    }
};
