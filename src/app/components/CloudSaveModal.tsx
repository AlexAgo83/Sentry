import { memo, useState } from "react";
import { ModalShell } from "./ModalShell";
import { CloudSavePanel } from "./CloudSavePanel";
import { useCloudSave } from "../hooks/useCloudSave";

type CloudSaveModalProps = {
    onClose: () => void;
};

export const CloudSaveModal = memo(({ onClose }: CloudSaveModalProps) => (
    <CloudSaveModalBody onClose={onClose} />
));

const CloudSaveModalBody = ({ onClose }: CloudSaveModalProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const cloud = useCloudSave();
    const backendUnavailable = cloud.isAvailable && (!cloud.isBackendAwake || cloud.status === "warming");
    const badgeLabel = !cloud.isAvailable ? "Offline" : backendUnavailable ? "Warming" : "Online";
    const badgeTone = !cloud.isAvailable
        ? "is-offline"
        : backendUnavailable
        ? "is-warming"
        : "is-online";

    return (
        <ModalShell
            kicker={<span className={`ts-system-cloud-badge ${badgeTone}`}>{badgeLabel}</span>}
            title="Cloud save"
            onClose={onClose}
        >
            <div className="ts-system-cloud-modal">
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
                    showHeader={false}
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
            </div>
        </ModalShell>
    );
};

CloudSaveModal.displayName = "CloudSaveModal";
