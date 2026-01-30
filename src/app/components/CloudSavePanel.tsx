import { memo } from "react";
import type { CloudSaveMeta } from "../hooks/useCloudSave";

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

const formatMetaLine = (label: string, meta: CloudSaveMeta | null) => {
    if (!meta) {
        return `${label}: none`;
    }
    const dateLabel = meta.updatedAt ? meta.updatedAt.toLocaleString() : "unknown";
    return `${label}: ${dateLabel} • score ${meta.virtualScore} • v${meta.appVersion}`;
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

    return (
        <div className="ts-system-cloud">
            <div className="ts-system-cloud-header">Cloud save</div>
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
                        />
                    </label>
                    <div className="ts-system-cloud-actions">
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={onRegister}
                            disabled={disabled}
                        >
                            Register
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={onLogin}
                            disabled={disabled}
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
                    >
                        Logout
                    </button>
                    <button
                        type="button"
                        className="generic-field button ts-focusable"
                        onClick={onRefresh}
                        disabled={authDisabled}
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
                    >
                        Retry now
                    </button>
                </div>
            ) : null}
            {isAuthenticated ? (
                <>
                    <div className="ts-system-cloud-diff">
                        <div>{formatMetaLine("Local", localMeta)}</div>
                        <div>{formatMetaLine("Cloud", cloudMeta)}</div>
                    </div>
                    <div className="ts-system-cloud-actions">
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={onLoadCloud}
                            disabled={disabled || !hasCloudSave}
                        >
                            Load cloud save
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={onOverwriteCloud}
                            disabled={disabled}
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
