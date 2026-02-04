import { useState } from "react";
import { CloudSavePanel } from "../components/CloudSavePanel";
import { useCloudSave } from "../hooks/useCloudSave";

export const CloudSavePanelContainer = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const cloud = useCloudSave();

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
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onLogin={() => cloud.authenticate("login", email, password)}
            onRegister={() => cloud.authenticate("register", email, password)}
            onRefresh={cloud.refreshCloud}
            onWarmupRetryNow={cloud.retryWarmupNow}
            onLogout={cloud.logout}
            onLoadCloud={cloud.loadCloud}
            onOverwriteCloud={cloud.overwriteCloud}
        />
    );
};
