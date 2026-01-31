import { memo } from "react";
import type { CloudSaveMeta } from "../hooks/useCloudSave";
import { formatNumberCompact, formatNumberFull } from "../ui/numberFormatters";

export type CloudSavePanelProps = {
    email: string;
    password: string;
    isAuthenticated: boolean;
    status: "idle" | "authenticating" | "ready" | "error" | "offline" | "warming";
    error: string | null;
    warmupRetrySeconds: number | null;
    isAvailable: boolean;
    hasCloudSave: boolean;
    localMeta: CloudSaveMeta;
    cloudMeta: CloudSaveMeta | null;
    lastSyncAt: Date | null;
    showHeader?: boolean;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onLogin: () => void;
    onRegister: () => void;
    onRefresh: () => void;
    onWarmupRetryNow: () => void;
    onLogout: () => void;
    onLoadCloud: () => void;
    onOverwriteCloud: () => void;
};

const formatMetaDate = (meta: CloudSaveMeta | null) => {
    if (!meta) {
        return "none";
    }
    return meta.updatedAt ? meta.updatedAt.toLocaleString() : "unknown";
};

const formatTimeAgo = (date: Date | null): string => {
    if (!date) {
        return "Never";
    }
    const diffSeconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
    if (diffSeconds < 60) {
        return `${diffSeconds}s ago`;
    }
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

export const CloudSavePanel = memo(({
    email,
    password,
    isAuthenticated,
    status,
    error,
    warmupRetrySeconds,
    isAvailable,
    hasCloudSave,
    localMeta,
    cloudMeta,
    lastSyncAt,
    showHeader = true,
    onEmailChange,
    onPasswordChange,
    onLogin,
    onRegister,
    onRefresh,
    onWarmupRetryNow,
    onLogout,
    onLoadCloud,
    onOverwriteCloud
}: CloudSavePanelProps) => {
    const disabled = !isAvailable || status === "authenticating" || status === "warming";
    const authDisabled = disabled || !isAuthenticated;
    const warmupLabel = warmupRetrySeconds && warmupRetrySeconds > 0
        ? `Cloud backend is waking up… retrying in ${warmupRetrySeconds}s.`
        : error ?? "Cloud backend is waking up…";
    const statusMessage = (() => {
        if (!isAvailable) {
            return "Cloud sync unavailable (missing API base or offline).";
        }
        if (status === "authenticating") {
            return "Authenticating…";
        }
        if (status === "warming") {
            return warmupLabel;
        }
        if (error) {
            return error;
        }
        if (isAuthenticated) {
            return hasCloudSave ? "Cloud save available." : "No cloud save found.";
        }
        return null;
    })();
    const isErrorMessage = Boolean(error) && status !== "warming";
    const badgeLabel = status === "warming" ? "Warming" : isAvailable ? "Online" : "Offline";
    const badgeTone = status === "warming"
        ? "is-warming"
        : isAvailable
            ? "is-online"
            : "is-offline";
    const lastSyncLabel = formatTimeAgo(lastSyncAt);
    const lastSyncTitle = lastSyncAt ? lastSyncAt.toLocaleString() : "Never";
    const localDateValue = localMeta.updatedAt?.getTime() ?? null;
    const cloudDateValue = cloudMeta?.updatedAt?.getTime() ?? null;
    const dateComparison = localDateValue !== null && cloudDateValue !== null
        ? Math.sign(localDateValue - cloudDateValue)
        : 0;
    const scoreComparison = cloudMeta
        ? Math.sign(localMeta.virtualScore - cloudMeta.virtualScore)
        : 0;
    const versionMismatch = cloudMeta ? localMeta.appVersion !== cloudMeta.appVersion : false;
    const localScoreLabel = formatNumberCompact(localMeta.virtualScore);
    const localScoreTitle = formatNumberFull(localMeta.virtualScore);
    const cloudScoreLabel = cloudMeta ? formatNumberCompact(cloudMeta.virtualScore) : "--";
    const cloudScoreTitle = cloudMeta ? formatNumberFull(cloudMeta.virtualScore) : "--";

    return (
        <div className="ts-system-cloud">
            {showHeader ? (
                <div className="ts-system-cloud-header">
                    <span>Cloud save</span>
                    <span className={`ts-system-cloud-badge ${badgeTone}`}>{badgeLabel}</span>
                </div>
            ) : null}
            {!isAuthenticated ? (
                <div className="ts-system-cloud-form">
                    <label className="ts-system-cloud-field">
                        <span>Email</span>
                        <input
                            className="generic-field input ts-system-cloud-input"
                            type="email"
                            value={email}
                            onChange={(event) => onEmailChange(event.currentTarget.value)}
                            placeholder="you@example.com"
                            disabled={disabled}
                            data-testid="cloud-email"
                        />
                    </label>
                    <label className="ts-system-cloud-field">
                        <span>Password</span>
                        <input
                            className="generic-field input ts-system-cloud-input"
                            type="password"
                            value={password}
                            onChange={(event) => onPasswordChange(event.currentTarget.value)}
                            placeholder="••••••"
                            disabled={disabled}
                            data-testid="cloud-password"
                        />
                    </label>
                    <div className="ts-system-cloud-actions">
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={onRegister}
                            disabled={disabled}
                            data-testid="cloud-register"
                        >
                            Register
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={onLogin}
                            disabled={disabled}
                            data-testid="cloud-login"
                        >
                            Login
                        </button>
                    </div>
                </div>
            ) : (
                <div className="ts-system-cloud-actions">
                    <button
                        type="button"
                        className="generic-field button ts-focusable"
                        onClick={onLogout}
                        disabled={disabled}
                        data-testid="cloud-logout"
                    >
                        Logout
                    </button>
                    <button
                        type="button"
                        className="generic-field button ts-focusable"
                        onClick={onRefresh}
                        disabled={authDisabled}
                        data-testid="cloud-refresh"
                    >
                        Check cloud
                    </button>
                </div>
            )}
            {statusMessage ? (
                <div className="ts-system-cloud-status">
                    {isErrorMessage ? (
                        <span className="ts-system-cloud-error">{statusMessage}</span>
                    ) : (
                        <span>{statusMessage}</span>
                    )}
                </div>
            ) : null}
            {status === "warming" ? (
                <div className="ts-system-cloud-actions">
                    <button
                        type="button"
                        className="generic-field button ts-focusable"
                        onClick={onWarmupRetryNow}
                        data-testid="cloud-retry"
                    >
                        Retry now
                    </button>
                </div>
            ) : null}
            {isAuthenticated ? (
                <>
                    <div className="ts-system-cloud-sync" title={lastSyncTitle}>
                        Last sync: {lastSyncLabel}
                    </div>
                    <div className="ts-system-cloud-diff">
                        <div
                            className="ts-system-cloud-diff-row ts-system-cloud-diff-header"
                            data-testid="cloud-diff-header"
                        >
                            <span />
                            <span>Updated</span>
                            <span>Score</span>
                            <span>Version</span>
                        </div>
                        <div className="ts-system-cloud-diff-row">
                            <span className="ts-system-cloud-diff-label">Local</span>
                            <span className={`ts-system-cloud-diff-value${dateComparison > 0 ? " is-better" : dateComparison < 0 ? " is-worse" : ""}`}>
                                {formatMetaDate(localMeta)}
                            </span>
                            <span
                                className={`ts-system-cloud-diff-value${scoreComparison > 0 ? " is-better" : scoreComparison < 0 ? " is-worse" : ""}`}
                                title={localScoreTitle}
                            >
                                {localScoreLabel}
                            </span>
                            <span className={`ts-system-cloud-diff-value${versionMismatch ? " is-different" : ""}`}>
                                v{localMeta.appVersion}
                            </span>
                        </div>
                        <div className="ts-system-cloud-diff-row">
                            <span className="ts-system-cloud-diff-label">Cloud</span>
                            <span className={`ts-system-cloud-diff-value${dateComparison < 0 ? " is-better" : dateComparison > 0 ? " is-worse" : ""}`}>
                                {formatMetaDate(cloudMeta)}
                            </span>
                            <span
                                className={`ts-system-cloud-diff-value${scoreComparison < 0 ? " is-better" : scoreComparison > 0 ? " is-worse" : ""}`}
                                title={cloudScoreTitle}
                            >
                                {cloudScoreLabel}
                            </span>
                            <span className={`ts-system-cloud-diff-value${versionMismatch ? " is-different" : ""}`}>
                                {cloudMeta ? `v${cloudMeta.appVersion}` : "--"}
                            </span>
                        </div>
                    </div>
                    <div className="ts-system-cloud-actions">
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={onLoadCloud}
                            disabled={disabled || !hasCloudSave}
                            data-testid="cloud-load"
                        >
                            Load cloud save
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={onOverwriteCloud}
                            disabled={disabled}
                            data-testid="cloud-overwrite"
                        >
                            Overwrite cloud with local
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    );
});

CloudSavePanel.displayName = "CloudSavePanel";
