export type ChangelogCommit = {
    sha: string;
    shortSha: string;
    message: string;
    author: string;
    committedAt: number;
    url?: string;
};

export type ChangelogCommitsResponse = {
    items: ChangelogCommit[];
    page: number;
    perPage: number;
    hasNextPage: boolean;
    source: "github";
};

type ChangelogErrorBody = {
    error?: string;
    code?: string;
};

export class ChangelogApiError extends Error {
    status: number;
    code: string;
    retryAfterSeconds: number | null;

    constructor(status: number, message: string, code = "unknown_error", retryAfterSeconds: number | null = null) {
        super(message || `Request failed (${status}).`);
        this.name = "ChangelogApiError";
        this.status = status;
        this.code = code;
        this.retryAfterSeconds = retryAfterSeconds;
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

const parseErrorResponse = async (response: Response): Promise<ChangelogApiError> => {
    const retryAfterRaw = response.headers.get("retry-after");
    const parsedRetryAfter = retryAfterRaw ? Number.parseInt(retryAfterRaw, 10) : Number.NaN;
    const retryAfterSeconds = Number.isFinite(parsedRetryAfter) ? Math.max(0, parsedRetryAfter) : null;

    let body: ChangelogErrorBody | null = null;
    try {
        body = await response.json() as ChangelogErrorBody;
    } catch {
        body = null;
    }

    const message = typeof body?.error === "string" && body.error.trim().length > 0
        ? body.error
        : `Request failed (${response.status}).`;
    const code = typeof body?.code === "string" && body.code.trim().length > 0
        ? body.code
        : "unknown_error";

    return new ChangelogApiError(response.status, message, code, retryAfterSeconds);
};

export const changelogClient = {
    async getCommits(page: number, perPage = 10): Promise<ChangelogCommitsResponse> {
        const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
        const safePerPage = Number.isFinite(perPage) ? Math.max(1, Math.min(10, Math.floor(perPage))) : 10;
        const query = new URLSearchParams({
            page: String(safePage),
            perPage: String(safePerPage)
        });
        const response = await fetch(buildUrl(`/api/changelog/commits?${query.toString()}`), {
            method: "GET",
            credentials: "omit",
            cache: "no-store"
        });
        if (!response.ok) {
            throw await parseErrorResponse(response);
        }
        return response.json() as Promise<ChangelogCommitsResponse>;
    }
};
