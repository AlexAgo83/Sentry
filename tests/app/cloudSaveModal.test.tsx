import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CloudSaveModal } from "../../src/app/components/CloudSaveModal";

const CLOUD_EMAIL_STORAGE_KEY = "sentry.cloud.lastEmail";

const cloudMock = {
    status: "idle" as const,
    error: null as string | null,
    warmupRetrySeconds: null as number | null,
    isBackendAwake: true,
    cloudMeta: null,
    localMeta: {
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
        virtualScore: 0,
        appVersion: "0.9.3",
        revision: null
    },
    lastSyncAt: null,
    hasCloudSave: false,
    localHasActiveDungeonRun: false,
    cloudHasActiveDungeonRun: false,
    profile: null as {
        email: string;
        username: string | null;
        maskedEmail: string;
        displayName: string;
    } | null,
    isUpdatingProfile: false,
    isAvailable: true,
    accessToken: null as string | null,
    autoSyncEnabled: false,
    autoSyncStatus: "idle" as const,
    autoSyncConflict: null as { meta: any; message: string } | null,
    authenticate: vi.fn(async () => {}),
    refreshCloud: vi.fn(async () => {}),
    refreshProfile: vi.fn(async () => {}),
    updateUsername: vi.fn(async (): Promise<{ ok: true } | { ok: false; error: string }> => ({ ok: true })),
    loadCloud: vi.fn(async () => {}),
    overwriteCloud: vi.fn(async () => {}),
    setAutoSyncEnabled: vi.fn(),
    resolveAutoSyncConflictByLoadingCloud: vi.fn(async () => {}),
    resolveAutoSyncConflictByOverwritingCloud: vi.fn(async () => {}),
    logout: vi.fn(),
    retryWarmupNow: vi.fn()
};

vi.mock("../../src/app/hooks/useCloudSave", () => ({
    useCloudSave: () => cloudMock
}));

describe("CloudSaveModal", () => {
    beforeEach(() => {
        window.localStorage.clear();
        cloudMock.status = "idle";
        cloudMock.error = null;
        cloudMock.isBackendAwake = true;
        cloudMock.profile = null;
        cloudMock.isUpdatingProfile = false;
        cloudMock.accessToken = null;
        cloudMock.updateUsername.mockReset();
        cloudMock.updateUsername.mockResolvedValue({ ok: true });
    });

    it("loads email from localStorage", () => {
        window.localStorage.setItem(CLOUD_EMAIL_STORAGE_KEY, "saved@example.com");
        render(<CloudSaveModal onClose={vi.fn()} />);
        expect((screen.getByTestId("cloud-email") as HTMLInputElement).value).toBe("saved@example.com");
    });

    it("persists latest typed email", () => {
        render(<CloudSaveModal onClose={vi.fn()} />);
        fireEvent.change(screen.getByTestId("cloud-email"), {
            target: { value: "new@example.com" }
        });
        expect(window.localStorage.getItem(CLOUD_EMAIL_STORAGE_KEY)).toBe("new@example.com");
    });

    it("allows authenticated users to edit username", async () => {
        cloudMock.accessToken = "token";
        cloudMock.profile = {
            email: "alex@example.com",
            username: "Aegis",
            maskedEmail: "a***x@example.com",
            displayName: "Aegis"
        };

        render(<CloudSaveModal onClose={vi.fn()} />);

        fireEvent.click(screen.getByRole("button", { name: "Edit username" }));
        const input = screen.getByRole("textbox", { name: "Username" }) as HTMLInputElement;
        expect(input.value).toBe("Aegis");
        fireEvent.change(input, { target: { value: "Sentinel" } });
        fireEvent.click(screen.getByRole("button", { name: "Save username" }));

        await waitFor(() => {
            expect(cloudMock.updateUsername).toHaveBeenCalledWith("Sentinel");
        });
    });

    it("shows validation errors returned by username update", async () => {
        cloudMock.accessToken = "token";
        cloudMock.profile = {
            email: "alex@example.com",
            username: null,
            maskedEmail: "a***x@example.com",
            displayName: "a***x@example.com"
        };
        cloudMock.updateUsername.mockResolvedValue({
            ok: false,
            error: "Username is already taken."
        });

        render(<CloudSaveModal onClose={vi.fn()} />);

        fireEvent.click(screen.getByRole("button", { name: "Edit username" }));
        fireEvent.change(screen.getByRole("textbox", { name: "Username" }), { target: { value: "Aegis" } });
        fireEvent.click(screen.getByRole("button", { name: "Save username" }));

        expect(await screen.findByText("Username is already taken.")).toBeTruthy();
    });
});
