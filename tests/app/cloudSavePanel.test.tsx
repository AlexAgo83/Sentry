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
    hasCloudSave: true,
    localMeta: {
        updatedAt: new Date("2024-01-01T10:00:00Z"),
        virtualScore: 120,
        appVersion: "0.8.11"
    },
    cloudMeta: {
        updatedAt: new Date("2024-01-02T10:00:00Z"),
        virtualScore: 140,
        appVersion: "0.8.11"
    },
    lastSyncAt: null,
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onLogin: vi.fn(),
    onRegister: vi.fn(),
    onRefresh: vi.fn(),
    onWarmupRetryNow: vi.fn(),
    onLogout: vi.fn(),
    onLoadCloud: vi.fn(),
    onOverwriteCloud: vi.fn()
};

describe("CloudSavePanel", () => {
    it("renders local and cloud metadata", () => {
        render(<CloudSavePanel {...baseProps} />);
        expect(screen.getByText("Local")).toBeTruthy();
        expect(screen.getByText("Cloud")).toBeTruthy();
        expect(screen.getByText(/Last sync:/)).toBeTruthy();
        expect(screen.getByRole("button", { name: "Load cloud save" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Overwrite cloud with local" })).toBeTruthy();
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

    it("shows logout when authenticated", () => {
        render(<CloudSavePanel {...baseProps} />);
        expect(screen.getByRole("button", { name: "Logout" })).toBeTruthy();
    });
});
