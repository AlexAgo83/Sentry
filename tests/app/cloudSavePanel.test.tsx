import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CloudSavePanel } from "../../src/app/components/CloudSavePanel";

const baseProps = {
    email: "",
    password: "",
    isAuthenticated: true,
    status: "ready" as const,
    error: null,
    warmupRetrySeconds: null,
    isAvailable: true,
    isBackendAwake: true,
    hasCloudSave: true,
    localMeta: {
        updatedAt: new Date("2024-01-01T10:00:00Z"),
        virtualScore: 120,
        appVersion: "0.8.11",
        revision: null
    },
    cloudMeta: {
        updatedAt: new Date("2024-01-02T10:00:00Z"),
        virtualScore: 140,
        appVersion: "0.8.11",
        revision: 2
    },
    lastSyncAt: null,
    localHasActiveDungeonRun: false,
    cloudHasActiveDungeonRun: false,
    username: "Aegis",
    displayName: "Aegis",
    maskedEmail: "a***s@example.com",
    autoSyncEnabled: false,
    autoSyncStatus: "idle" as const,
    autoSyncConflict: null,
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onLogin: vi.fn(),
    onRegister: vi.fn(),
    onRefresh: vi.fn(),
    onWarmupRetryNow: vi.fn(),
    onLogout: vi.fn(),
    onEditUsername: vi.fn(),
    onLoadCloud: vi.fn(),
    onOverwriteCloud: vi.fn(),
    onSetAutoSyncEnabled: vi.fn(),
    onResolveAutoSyncConflictLoadCloud: vi.fn(),
    onResolveAutoSyncConflictOverwriteCloud: vi.fn()
};

describe("CloudSavePanel", () => {
    it("renders local and cloud metadata", () => {
        render(<CloudSavePanel {...baseProps} />);
        expect(screen.getByText("Local")).toBeTruthy();
        expect(screen.getByText("Cloud")).toBeTruthy();
        expect(screen.getByText(/Last sync:/)).toBeTruthy();
        expect(screen.getByRole("button", { name: "Load cloud save" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Overwrite cloud with local" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Edit username" })).toBeTruthy();
    });

    it("disables actions when unavailable", () => {
        render(<CloudSavePanel {...baseProps} isAvailable={false} />);
        expect(screen.getByText(/Cloud sync unavailable/)).toBeTruthy();
        expect(screen.getByRole("button", { name: "Load cloud save" }).hasAttribute("disabled")).toBe(true);
    });

    it("hides cloud details when unauthenticated", () => {
        render(<CloudSavePanel {...baseProps} isAuthenticated={false} />);
        expect(screen.getByRole("button", { name: "Register" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Login" })).toBeTruthy();
        expect(screen.queryByText("Local")).toBeNull();
        expect(screen.queryByText("Cloud")).toBeNull();
        expect(screen.queryByRole("button", { name: "Load cloud save" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Overwrite cloud with local" })).toBeNull();
    });

    it("hides auth controls while backend is waking up", () => {
        render(
            <CloudSavePanel
                {...baseProps}
                isAuthenticated={false}
                isBackendAwake={false}
                status="warming"
                error="Cloud backend is waking up."
            />
        );
        expect(screen.queryByRole("button", { name: "Register" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Login" })).toBeNull();
        expect(screen.getByRole("button", { name: "Retry now" })).toBeTruthy();
    });

    it("exposes password-manager friendly auth field attributes", () => {
        render(<CloudSavePanel {...baseProps} isAuthenticated={false} />);
        const email = screen.getByTestId("cloud-email");
        const password = screen.getByTestId("cloud-password");

        expect(email.getAttribute("name")).toBe("email");
        expect(email.getAttribute("autocomplete")).toBe("username");
        expect(password.getAttribute("name")).toBe("password");
        expect(password.getAttribute("autocomplete")).toBe("current-password");
    });

    it("shows logout when authenticated", () => {
        render(<CloudSavePanel {...baseProps} />);
        expect(screen.getByRole("button", { name: "Logout" })).toBeTruthy();
    });

    it("shows a recommendation badge when an active run conflicts with a newer save", () => {
        render(
            <CloudSavePanel
                {...baseProps}
                localHasActiveDungeonRun
                cloudHasActiveDungeonRun={false}
            />
        );
        const loadButton = screen.getByTestId("cloud-load");
        expect(loadButton.querySelector(".ts-system-cloud-reco")).toBeTruthy();
        expect(screen.queryByTestId("cloud-run-active-warning")).toBeNull();
    });
});
