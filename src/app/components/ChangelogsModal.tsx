import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { changelogClient, type ChangelogApiError, type ChangelogCommit, type ChangelogCommitsResponse } from "../api/changelogClient";
import { ModalShell } from "./ModalShell";

type ChangelogsModalProps = {
    onClose: () => void;
    closeLabel?: string;
};

const PER_PAGE = 10;
const SCROLL_TRIGGER_OFFSET_PX = 56;
const COMMIT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
});

const toIsoDate = (timestamp: number): string => {
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
        return "";
    }
    return new Date(timestamp).toISOString();
};

const formatCommitDateLabel = (timestamp: number): string => {
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
        return "Unknown date";
    }
    return COMMIT_DATE_FORMATTER.format(new Date(timestamp));
};

const formatErrorMessage = (error: ChangelogApiError | null): string => {
    if (!error) {
        return "Unable to load changelogs.";
    }
    if (error.code === "rate_limited" && error.retryAfterSeconds !== null) {
        return `GitHub rate limit reached. Retry in about ${error.retryAfterSeconds}s.`;
    }
    return error.message || "Unable to load changelogs.";
};

export const ChangelogsModal = memo(({ onClose, closeLabel }: ChangelogsModalProps) => {
    const [items, setItems] = useState<ChangelogCommit[]>([]);
    const [nextPage, setNextPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedAtLeastOnce, setLoadedAtLeastOnce] = useState(false);
    const [error, setError] = useState<ChangelogApiError | null>(null);
    const pageCacheRef = useRef<Map<number, ChangelogCommitsResponse>>(new Map());
    const loadedPagesRef = useRef<Set<number>>(new Set());
    const requestIdRef = useRef(0);
    const failedPageRef = useRef<number | null>(null);
    const listShellRef = useRef<HTMLDivElement | null>(null);
    const bootstrappedRef = useRef(false);

    const appendUniqueItems = useCallback((incoming: ChangelogCommit[]) => {
        setItems((previous) => {
            const seen = new Set(previous.map((item) => item.sha));
            const merged = [...previous];
            for (const item of incoming) {
                if (seen.has(item.sha)) {
                    continue;
                }
                seen.add(item.sha);
                merged.push(item);
            }
            return merged;
        });
    }, []);

    const loadPage = useCallback(async (pageToLoad: number, options?: { force?: boolean }) => {
        const force = options?.force ?? false;
        if (!force && (isLoading || loadedPagesRef.current.has(pageToLoad))) {
            return;
        }
        const cached = pageCacheRef.current.get(pageToLoad);
        if (cached && !force) {
            loadedPagesRef.current.add(pageToLoad);
            appendUniqueItems(cached.items);
            setNextPage(cached.page + 1);
            setHasNextPage(cached.hasNextPage);
            setLoadedAtLeastOnce(true);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        try {
            const data = await changelogClient.getCommits(pageToLoad, PER_PAGE);
            if (requestId !== requestIdRef.current) {
                return;
            }
            pageCacheRef.current.set(pageToLoad, data);
            loadedPagesRef.current.add(pageToLoad);
            appendUniqueItems(data.items);
            setNextPage(data.page + 1);
            setHasNextPage(data.hasNextPage);
            setLoadedAtLeastOnce(true);
            failedPageRef.current = null;
        } catch (rawError) {
            if (requestId !== requestIdRef.current) {
                return;
            }
            const apiError = rawError instanceof Error
                ? rawError
                : new Error("Unable to load changelogs.");
            const normalizedError = apiError as ChangelogApiError;
            failedPageRef.current = pageToLoad;
            setError(normalizedError);
        } finally {
            if (requestId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, [appendUniqueItems, isLoading]);

    const loadNextPage = useCallback((options?: { force?: boolean; page?: number }) => {
        const page = options?.page ?? nextPage;
        if (!options?.force && !hasNextPage) {
            return;
        }
        void loadPage(page, { force: options?.force ?? false });
    }, [hasNextPage, loadPage, nextPage]);

    useEffect(() => {
        if (bootstrappedRef.current) {
            return;
        }
        bootstrappedRef.current = true;
        loadNextPage({ page: 1 });
    }, [loadNextPage]);

    useEffect(() => {
        const node = listShellRef.current;
        if (!node || isLoading || error || !hasNextPage || items.length === 0) {
            return;
        }
        if (node.scrollHeight <= node.clientHeight + 4) {
            loadNextPage();
        }
    }, [error, hasNextPage, isLoading, items.length, loadNextPage]);

    const handleScroll = useCallback(() => {
        if (isLoading || error || !hasNextPage) {
            return;
        }
        const node = listShellRef.current;
        if (!node) {
            return;
        }
        const reachedBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - SCROLL_TRIGGER_OFFSET_PX;
        if (reachedBottom) {
            loadNextPage();
        }
    }, [error, hasNextPage, isLoading, loadNextPage]);

    const showInitialLoading = isLoading && items.length === 0;
    const showInitialError = error !== null && items.length === 0;
    const showAppendLoading = isLoading && items.length > 0;
    const showAppendError = error !== null && items.length > 0;
    const errorMessage = useMemo(() => formatErrorMessage(error), [error]);

    return (
        <ModalShell kicker="System" title="Change" onClose={onClose} closeLabel={closeLabel}>
            <div
                className="ts-changelog-list-shell"
                data-testid="changelog-list-shell"
                ref={listShellRef}
                onScroll={handleScroll}
            >
                {showInitialLoading ? (
                    <p className="ts-system-helper" data-testid="changelog-loading">Loading changelogs...</p>
                ) : null}
                {showInitialError ? (
                    <div className="ts-changelog-error" data-testid="changelog-error">
                        <p className="ts-system-helper">{errorMessage}</p>
                        <div className="ts-action-row ts-system-actions">
                            <button
                                type="button"
                                className="generic-field button ts-devtools-button ts-focusable"
                                onClick={() => {
                                    loadNextPage({ force: true, page: failedPageRef.current ?? 1 });
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : null}
                {!showInitialLoading && !showInitialError && loadedAtLeastOnce && items.length === 0 ? (
                    <p className="ts-system-helper" data-testid="changelog-empty">No commits found.</p>
                ) : null}
                {items.length > 0 ? (
                    <ul className="ts-changelog-list" data-testid="changelog-list">
                        {items.map((item) => (
                            <ChangelogCommitRow key={item.sha} item={item} />
                        ))}
                    </ul>
                ) : null}
                {showAppendLoading ? (
                    <div className="ts-changelog-infinite-state" data-testid="changelog-loading-more">
                        <span className="ts-system-helper">Loading more...</span>
                    </div>
                ) : null}
                {showAppendError ? (
                    <div className="ts-changelog-infinite-state" data-testid="changelog-append-error">
                        <span className="ts-system-helper">{errorMessage}</span>
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={() => {
                                loadNextPage({ force: true, page: failedPageRef.current ?? nextPage });
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : null}
                {!hasNextPage && items.length > 0 && !showAppendLoading && !showAppendError ? (
                    <div className="ts-changelog-infinite-state" data-testid="changelog-end">
                        <span className="ts-system-helper">End of changelogs.</span>
                    </div>
                ) : null}
            </div>
        </ModalShell>
    );
});

const ChangelogCommitRow = ({ item }: { item: ChangelogCommit }) => {
    return (
        <li className="ts-changelog-item">
            <div className="ts-changelog-item-header">
                <span className="ts-changelog-sha">{item.shortSha}</span>
                <time
                    className="ts-changelog-date"
                    dateTime={toIsoDate(item.committedAt)}
                    title={toIsoDate(item.committedAt)}
                >
                    {formatCommitDateLabel(item.committedAt)}
                </time>
            </div>
            <p className="ts-changelog-title">{item.message}</p>
            <div className="ts-changelog-footer">
                <div className="ts-changelog-meta">
                    <span className="ts-changelog-meta-label">by</span>
                    <span className="ts-changelog-meta-value">{item.author}</span>
                </div>
                {item.url ? (
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ts-changelog-link ts-focusable"
                    >
                        View commit
                    </a>
                ) : null}
            </div>
        </li>
    );
};

ChangelogsModal.displayName = "ChangelogsModal";
