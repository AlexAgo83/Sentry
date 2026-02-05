import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CloudSaveModal } from "../../src/app/components/CloudSaveModal";

const CLOUD_EMAIL_STORAGE_KEY = "sentry.cloud.lastEmail";

vi.mock("../../src/app/hooks/useCloudSave", () => ({
    useCloudSave: () => ({
        status: "idle",
        error: null,
        warmupRetrySeconds: null,
        isBackendAwake: true,
        cloudMeta: null,
        localMeta: {
            updatedAt: new Date("2024-01-01T00:00:00.000Z"),
            virtualScore: 0,
            appVersion: "0.9.3"
        },
        lastSyncAt: null,
        hasCloudSave: false,
        localHasActiveDungeonRun: false,
        cloudHasActiveDungeonRun: false,
        isAvailable: true,
        accessToken: null,
        authenticate: vi.fn(async () => {}),
        refreshCloud: vi.fn(async () => {}),
        loadCloud: vi.fn(async () => {}),
        overwriteCloud: vi.fn(async () => {}),
        logout: vi.fn(),
        retryWarmupNow: vi.fn()
    })
}));

describe("CloudSaveModal", () => {
    beforeEach(() => {
        window.localStorage.clear();
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
});
