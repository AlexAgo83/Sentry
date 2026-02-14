import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    leaderboardClient,
    LeaderboardApiError,
    type LeaderboardEntry,
    type LeaderboardResponse
} from "../api/leaderboardClient";
import { formatNumberCompact, formatNumberFull } from "../ui/numberFormatters";
import { ModalShell } from "./ModalShell";

type LeaderboardModalProps = {
    onClose: () => void;
    closeLabel?: string;
};

const PER_PAGE = 10;
const SCROLL_TRIGGER_OFFSET_PX = 56;
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
});

const toIsoDate = (value: string): string => {
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) {
        return "";
    }
    return new Date(timestamp).toISOString();
};

const formatDate = (value: string): string => {
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) {
        return "Unknown";
    }
    return DATE_FORMATTER.format(new Date(timestamp));
};

const formatErrorMessage = (error: LeaderboardApiError | null): string => {
    if (!error) {
        return "Unable to load leaderboard.";
    }
    return error.message || "Unable to load leaderboard.";
};

type RankedEntry = LeaderboardEntry & {
    rank: number;
};

const withRanks = (items: LeaderboardEntry[]): RankedEntry[] => {
    let lastScore: number | null = null;
    let lastRank = 0;
    return items.map((item, index) => {
        const baseRank = index + 1;
        const rank = lastScore !== null && item.virtualScore === lastScore ? lastRank : baseRank;
        lastScore = item.virtualScore;
        lastRank = rank;
        return {
            ...item,
            rank
        };
    });
};

export const LeaderboardModal = memo(({ onClose, closeLabel }: LeaderboardModalProps) => {
    const [items, setItems] = useState<LeaderboardEntry[]>([]);
    const [nextPage, setNextPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedAtLeastOnce, setLoadedAtLeastOnce] = useState(false);
    const [error, setError] = useState<LeaderboardApiError | null>(null);
    const pageCacheRef = useRef<Map<number, LeaderboardResponse>>(new Map());
    const loadedPagesRef = useRef<Set<number>>(new Set());
    const requestIdRef = useRef(0);
    const failedPageRef = useRef<number | null>(null);
    const listShellRef = useRef<HTMLDivElement | null>(null);
    const bootstrappedRef = useRef(false);

    const appendUniqueItems = useCallback((incoming: LeaderboardEntry[]) => {
        setItems((previous) => {
            const seen = new Set(previous.map((item) => item.userId));
            const merged = [...previous];
            for (const item of incoming) {
                if (seen.has(item.userId)) {
                    continue;
                }
                seen.add(item.userId);
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
            const data = await leaderboardClient.getEntries(pageToLoad, PER_PAGE);
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
            const normalizedError = rawError instanceof LeaderboardApiError
                ? rawError
                : new LeaderboardApiError(500, "Unable to load leaderboard.");
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

    const rankedItems = useMemo(() => withRanks(items), [items]);
    const showInitialLoading = isLoading && rankedItems.length === 0;
    const showInitialError = error !== null && rankedItems.length === 0;
    const showAppendLoading = isLoading && rankedItems.length > 0;
    const showAppendError = error !== null && rankedItems.length > 0;
    const showEndMarker = !hasNextPage
        && rankedItems.length > 0
        && !showAppendLoading
        && !showAppendError
        && (nextPage > 2 || rankedItems.length >= PER_PAGE);
    const errorMessage = useMemo(() => formatErrorMessage(error), [error]);

    return (
        <ModalShell kicker="System" title="Scrore" onClose={onClose} closeLabel={closeLabel}>
            <div
                className="ts-leaderboard-list-shell"
                data-testid="leaderboard-list-shell"
                ref={listShellRef}
                onScroll={handleScroll}
            >
                {showInitialLoading ? (
                    <p className="ts-system-helper" data-testid="leaderboard-loading">Loading leaderboard...</p>
                ) : null}
                {showInitialError ? (
                    <div className="ts-leaderboard-error" data-testid="leaderboard-error">
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
                {!showInitialLoading && !showInitialError && loadedAtLeastOnce && rankedItems.length === 0 ? (
                    <p className="ts-system-helper" data-testid="leaderboard-empty">No entries yet.</p>
                ) : null}
                {rankedItems.length > 0 ? (
                    <ul className="ts-leaderboard-list" data-testid="leaderboard-list">
                        {rankedItems.map((item) => (
                            <LeaderboardRow key={item.userId} item={item} />
                        ))}
                    </ul>
                ) : null}
                {showAppendLoading ? (
                    <div className="ts-leaderboard-infinite-state" data-testid="leaderboard-loading-more">
                        <span className="ts-system-helper">Loading more...</span>
                    </div>
                ) : null}
                {showAppendError ? (
                    <div className="ts-leaderboard-infinite-state" data-testid="leaderboard-append-error">
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
                {showEndMarker ? (
                    <div className="ts-leaderboard-infinite-state" data-testid="leaderboard-end">
                        <span className="ts-system-helper">End of leaderboard.</span>
                    </div>
                ) : null}
            </div>
        </ModalShell>
    );
});

const LeaderboardRow = ({ item }: { item: RankedEntry }) => {
    const scoreCompact = formatNumberCompact(item.virtualScore);
    const scoreFull = formatNumberFull(item.virtualScore);
    const isEmailLike = item.displayName.includes("@");

    return (
        <li className="ts-leaderboard-item">
            <div className="ts-leaderboard-item-header">
                <div className="ts-leaderboard-rank-group">
                    <span className="ts-leaderboard-rank">#{item.rank}</span>
                    {item.isExAequo ? (
                        <span className="ts-leaderboard-tie">Ex aequo</span>
                    ) : null}
                </div>
                <div className="ts-leaderboard-updated">
                    <time
                        className="ts-leaderboard-date"
                        dateTime={toIsoDate(item.updatedAt)}
                        title={toIsoDate(item.updatedAt)}
                    >
                        {formatDate(item.updatedAt)}
                    </time>
                </div>
            </div>
            <p className={`ts-leaderboard-name${isEmailLike ? " is-email" : ""}`}>{item.displayName}</p>
            <div className="ts-leaderboard-footer">
                <div className="ts-leaderboard-score-group">
                    <span className="ts-leaderboard-score-label">Virtual score</span>
                    <span className="ts-leaderboard-score" title={scoreFull}>{scoreCompact}</span>
                </div>
                <span className="ts-leaderboard-version">Build v{item.appVersion}</span>
            </div>
        </li>
    );
};

LeaderboardModal.displayName = "LeaderboardModal";
