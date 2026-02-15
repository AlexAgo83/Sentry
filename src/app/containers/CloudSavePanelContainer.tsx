import { useEffect, useState } from "react";
import { CloudSavePanel } from "../components/CloudSavePanel";
import { useCloudSave } from "../hooks/useCloudSave";

const CLOUD_EMAIL_STORAGE_KEY = "sentry.cloud.lastEmail";

export const CloudSavePanelContainer = () => {
    const [email, setEmail] = useState(() => {
        if (typeof window === "undefined") {
            return "";
        }
        try {
            return window.localStorage.getItem(CLOUD_EMAIL_STORAGE_KEY) ?? "";
        } catch {
            return "";
        }
    });
    const [password, setPassword] = useState("");
    const cloud = useCloudSave();

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        try {
            window.localStorage.setItem(CLOUD_EMAIL_STORAGE_KEY, email);
        } catch {
            // Ignore localStorage failures.
        }
    }, [email]);

    return (
        <CloudSavePanel
            email={email}
            password={password}
            isAuthenticated={Boolean(cloud.accessToken)}
            status={cloud.status}
            error={cloud.error}
            warmupRetrySeconds={cloud.warmupRetrySeconds}
            isAvailable={cloud.isAvailable}
            isBackendAwake={cloud.isBackendAwake}
            hasCloudSave={cloud.hasCloudSave}
            localMeta={cloud.localMeta}
            cloudMeta={cloud.cloudMeta}
            lastSyncAt={cloud.lastSyncAt}
            localHasActiveDungeonRun={cloud.localHasActiveDungeonRun}
            cloudHasActiveDungeonRun={cloud.cloudHasActiveDungeonRun}
            username={cloud.profile?.username ?? null}
            displayName={cloud.profile?.displayName ?? null}
            autoSyncEnabled={cloud.autoSyncEnabled}
            autoSyncStatus={cloud.autoSyncStatus}
            autoSyncConflict={cloud.autoSyncConflict}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onLogin={() => cloud.authenticate("login", email, password)}
            onRegister={() => cloud.authenticate("register", email, password)}
            onRefresh={cloud.refreshCloud}
            onWarmupRetryNow={cloud.retryWarmupNow}
            onLogout={cloud.logout}
            onLoadCloud={() => cloud.loadCloud()}
            onOverwriteCloud={() => cloud.overwriteCloud()}
            onSetAutoSyncEnabled={cloud.setAutoSyncEnabled}
            onResolveAutoSyncConflictLoadCloud={cloud.resolveAutoSyncConflictByLoadingCloud}
            onResolveAutoSyncConflictOverwriteCloud={cloud.resolveAutoSyncConflictByOverwritingCloud}
        />
    );
};
