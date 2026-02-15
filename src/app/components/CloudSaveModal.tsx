import { memo, useCallback, useMemo, useState } from "react";
import { ModalShell } from "./ModalShell";
import { CloudSavePanel } from "./CloudSavePanel";
import { HeroNameModal } from "./HeroNameModal";
import { useCloudSave } from "../hooks/useCloudSave";

type CloudSaveModalProps = {
    onClose: () => void;
    closeLabel?: string;
};

const CLOUD_EMAIL_STORAGE_KEY = "sentry.cloud.lastEmail";

const loadStoredEmail = () => {
    if (typeof window === "undefined") {
        return "";
    }
    try {
        return window.localStorage.getItem(CLOUD_EMAIL_STORAGE_KEY) ?? "";
    } catch {
        return "";
    }
};

const saveStoredEmail = (value: string) => {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(CLOUD_EMAIL_STORAGE_KEY, value);
    } catch {
        // Ignore localStorage failures.
    }
};

export const CloudSaveModal = memo(({ onClose, closeLabel }: CloudSaveModalProps) => (
    <CloudSaveModalBody onClose={onClose} closeLabel={closeLabel} />
));

const CloudSaveModalBody = ({ onClose, closeLabel }: CloudSaveModalProps) => {
    const [email, setEmail] = useState(loadStoredEmail);
    const [password, setPassword] = useState("");
    const [isEditUsernameOpen, setEditUsernameOpen] = useState(false);
    const [usernameDraft, setUsernameDraft] = useState("");
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const cloud = useCloudSave();
    const handleEmailChange = useCallback((value: string) => {
        setEmail(value);
        saveStoredEmail(value);
    }, []);
    const backendUnavailable = cloud.isAvailable && (!cloud.isBackendAwake || cloud.status === "warming");
    const badgeLabel = !cloud.isAvailable ? "Offline" : backendUnavailable ? "Warming" : "Online";
    const badgeTone = !cloud.isAvailable
        ? "is-offline"
        : backendUnavailable
        ? "is-warming"
        : "is-online";
    const canEditUsername = Boolean(cloud.accessToken);
    const effectiveUsername = cloud.profile?.username ?? null;
    const usernameDisplay = useMemo(() => cloud.profile?.displayName ?? null, [cloud.profile]);

    const openEditUsername = useCallback(() => {
        if (!canEditUsername) {
            return;
        }
        setUsernameDraft(effectiveUsername ?? "");
        setUsernameError(null);
        setEditUsernameOpen(true);
    }, [canEditUsername, effectiveUsername]);

    const closeEditUsername = useCallback(() => {
        setEditUsernameOpen(false);
        setUsernameError(null);
    }, []);

    const submitUsername = useCallback(async () => {
        const result = await cloud.updateUsername(usernameDraft);
        if (result.ok) {
            setEditUsernameOpen(false);
            setUsernameError(null);
            return;
        }
        setUsernameError(result.error);
    }, [cloud, usernameDraft]);

    if (isEditUsernameOpen) {
        return (
            <HeroNameModal
                kicker="Cloud"
                title="Username"
                name={usernameDraft}
                submitLabel="Save username"
                isSubmitDisabled={cloud.isUpdatingProfile}
                onNameChange={(value) => {
                    setUsernameDraft(value);
                    if (usernameError) {
                        setUsernameError(null);
                    }
                }}
                onSubmit={() => {
                    void submitUsername();
                }}
                onClose={closeEditUsername}
                fieldLabel="Username"
                inputId="cloud-username-input"
                maxLength={16}
                placeholder="Letters and numbers only"
                helperText={usernameError}
            />
        );
    }

    return (
        <ModalShell
            kicker={<span className={`ts-system-cloud-badge ${badgeTone}`}>{badgeLabel}</span>}
            title={(
                <span className="ts-cloud-modal-title">
                    <span>Cloud</span>
                    <span className="ts-cloud-modal-title-suffix"> Save</span>
                </span>
            )}
            onClose={onClose}
            closeLabel={closeLabel}
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
                    username={effectiveUsername}
                    displayName={usernameDisplay}
                    autoSyncEnabled={cloud.autoSyncEnabled}
                    autoSyncStatus={cloud.autoSyncStatus}
                    autoSyncConflict={cloud.autoSyncConflict}
                    showHeader={false}
                    onEmailChange={handleEmailChange}
                    onPasswordChange={setPassword}
                    onLogin={() => cloud.authenticate("login", email, password)}
                    onRegister={() => cloud.authenticate("register", email, password)}
                    onRefresh={cloud.refreshCloud}
                    onWarmupRetryNow={cloud.retryWarmupNow}
                    onLogout={cloud.logout}
                    onEditUsername={openEditUsername}
                    onLoadCloud={() => cloud.loadCloud()}
                    onOverwriteCloud={() => cloud.overwriteCloud()}
                    onSetAutoSyncEnabled={cloud.setAutoSyncEnabled}
                    onResolveAutoSyncConflictLoadCloud={cloud.resolveAutoSyncConflictByLoadingCloud}
                    onResolveAutoSyncConflictOverwriteCloud={cloud.resolveAutoSyncConflictByOverwritingCloud}
                />
            </div>
        </ModalShell>
    );
};

CloudSaveModal.displayName = "CloudSaveModal";
