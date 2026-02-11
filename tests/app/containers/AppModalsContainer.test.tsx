import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ComponentProps } from "react";
import type { SwUpdateAvailableDetail } from "../../../src/pwa/serviceWorker";

const systemSpy = vi.fn();

vi.mock("../../../src/app/containers/SystemModalContainer", () => ({
    SystemModalContainer: (props: { onClose: () => void }) => {
        systemSpy(props);
        return (
            <div data-testid="system">
                <button type="button" onClick={props.onClose}>close-system</button>
            </div>
        );
    },
}));

vi.mock("../../../src/app/components/HeroNameModal", () => ({
    HeroNameModal: (props: {
        kicker: string;
        title: string;
        name: string;
        submitLabel: string;
        isSubmitDisabled: boolean;
        onNameChange: (value: string) => void;
        onSubmit: () => void;
        onClose: () => void;
    }) => (
        <div data-testid={`hero-name-${props.kicker}`}>
            <div>{props.title}</div>
            <div data-testid="disabled">{props.isSubmitDisabled ? "1" : "0"}</div>
            <input
                aria-label="hero-name"
                value={props.name}
                onChange={(event) => props.onNameChange((event.target as HTMLInputElement).value)}
            />
            <button type="button" onClick={props.onSubmit} disabled={props.isSubmitDisabled}>{props.submitLabel}</button>
            <button type="button" onClick={props.onClose}>close</button>
        </div>
    ),
}));

vi.mock("../../../src/app/components/OfflineSummaryModal", () => ({
    OfflineSummaryModal: (props: { summary: { durationMs: number }; onClose: () => void }) => (
        <div data-testid="offline-summary" data-duration={String(props.summary.durationMs)}>
            <button type="button" onClick={props.onClose}>close-offline</button>
        </div>
    ),
}));

vi.mock("../../../src/app/components/ServiceWorkerUpdateModal", () => ({
    ServiceWorkerUpdateModal: (props: { version: string; onReload: () => void; onClose: () => void }) => (
        <div data-testid="sw-update" data-version={props.version}>
            <button type="button" onClick={props.onReload}>reload</button>
            <button type="button" onClick={props.onClose}>close-sw</button>
        </div>
    ),
}));

vi.mock("../../../src/app/components/SafeModeModal", () => ({
    SafeModeModal: (props: {
        report: { status: string };
        canCopyCurrentRawSave: boolean;
        canCopyLastGoodRawSave: boolean;
        onCopyCurrentRawSave: () => void;
        onCopyLastGoodRawSave: () => void;
        onResetSave: () => void;
        onClose: () => void;
    }) => (
        <div
            data-testid="safe-mode"
            data-status={props.report.status}
            data-can-current={props.canCopyCurrentRawSave ? "1" : "0"}
            data-can-last={props.canCopyLastGoodRawSave ? "1" : "0"}
        >
            <button type="button" onClick={props.onCopyCurrentRawSave}>copy-current</button>
            <button type="button" onClick={props.onCopyLastGoodRawSave}>copy-last</button>
            <button type="button" onClick={props.onResetSave}>reset</button>
            <button type="button" onClick={props.onClose}>close-safe</button>
        </div>
    ),
}));

import { AppModalsContainer } from "../../../src/app/containers/AppModalsContainer";

const baseProps = (): ComponentProps<typeof AppModalsContainer> => ({
    version: "0.8.3",
    getSkillLabel: () => "Combat",
    getRecipeLabel: () => "recipe",
    crashReports: [],
    onClearCrashReports: vi.fn(),
    onExportSave: vi.fn(),
    onImportSave: vi.fn(),
    onSimulateOffline: vi.fn(),
    onSimulateOfflineHour: vi.fn(),
    onSimulateOfflineDay: vi.fn(),
    onResetSave: vi.fn(),
    onCloseSystem: vi.fn(),
    isLocalSaveOpen: false,
    onCloseLocalSave: vi.fn(),
    isCloudSaveOpen: false,
    onCloseCloudSave: vi.fn(),
    isOnboardingOpen: false,
    onboardingHeroName: "",
    onOnboardingHeroNameChange: vi.fn(),
    onCreateOnboardingHero: vi.fn(),
    onCloseOfflineSummary: vi.fn(),
    offlineSummary: null,
    swUpdate: null,
    onReloadSwUpdate: vi.fn(),
    onCloseSwUpdate: vi.fn(),
    isSafeModeOpen: false,
    loadReport: { status: "empty", recoveredFromLastGood: false },
    canCopyCurrentRawSave: false,
    canCopyLastGoodRawSave: false,
    onCopyCurrentRawSave: vi.fn(),
    onCopyLastGoodRawSave: vi.fn(),
    onCloseSafeMode: vi.fn(),
    isSystemOpen: false,
    isDevToolsOpen: false,
    onCloseDevTools: vi.fn(),
    isRecruitOpen: false,
    newHeroName: "",
    onNewHeroNameChange: vi.fn(),
    onCreateHero: vi.fn(),
    onCloseRecruit: vi.fn(),
    isRenameOpen: false,
    renameHeroName: "",
    onRenameHeroNameChange: vi.fn(),
    onRenameHero: vi.fn(),
    onCloseRename: vi.fn(),
});

describe("AppModalsContainer", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        systemSpy.mockClear();
    });

    it("renders recruit modal and wires callbacks", () => {
        const props = baseProps();
        props.isRecruitOpen = true;
        const { rerender } = render(<AppModalsContainer {...props} />);

        expect(screen.getByTestId("hero-name-Recruit")).toBeTruthy();
        expect(screen.getByTestId("disabled").textContent).toBe("1");

        fireEvent.change(screen.getByLabelText("hero-name"), { target: { value: "Nova" } });
        expect(props.onNewHeroNameChange).toHaveBeenCalledWith("Nova");

        rerender(<AppModalsContainer {...{ ...props, newHeroName: "Nova" }} />);
        expect(screen.getByTestId("disabled").textContent).toBe("0");

        fireEvent.click(screen.getByRole("button", { name: "Create hero" }));
        expect(props.onCreateHero).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: "close" }));
        expect(props.onCloseRecruit).toHaveBeenCalledTimes(1);
    });

    it("renders rename modal and wires callbacks", () => {
        const props = baseProps();
        props.isRenameOpen = true;
        props.renameHeroName = "Mara";
        render(<AppModalsContainer {...props} />);

        expect(screen.getByTestId("hero-name-Set name")).toBeTruthy();
        expect(screen.getByTestId("disabled").textContent).toBe("0");

        fireEvent.change(screen.getByLabelText("hero-name"), { target: { value: "Iris" } });
        expect(props.onRenameHeroNameChange).toHaveBeenCalledWith("Iris");

        fireEvent.click(screen.getByRole("button", { name: "Save name" }));
        expect(props.onRenameHero).toHaveBeenCalledTimes(1);
    });

    it("renders system modal when open and closes", () => {
        const props = baseProps();
        props.isSystemOpen = true;
        render(<AppModalsContainer {...props} />);

        expect(systemSpy).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole("button", { name: "close-system" }));
        expect(props.onCloseSystem).toHaveBeenCalledTimes(1);
    });

    it("renders offline summary when present and closes", () => {
        const props = baseProps();
        props.offlineSummary = {
            durationMs: 12500,
            processedMs: 12500,
            ticks: 10,
            capped: false,
            players: [],
            totalItemDeltas: {}
        };
        render(<AppModalsContainer {...props} />);

        const node = screen.getByTestId("offline-summary");
        expect(node.getAttribute("data-duration")).toBe("12500");
        fireEvent.click(screen.getByRole("button", { name: "close-offline" }));
        expect(props.onCloseOfflineSummary).toHaveBeenCalledTimes(1);
    });

    it("renders sw update prompt when available", () => {
        const props = baseProps();
        props.swUpdate = { version: "1.2.3", registration: null } as unknown as SwUpdateAvailableDetail;
        props.onReloadSwUpdate = vi.fn();
        props.onCloseSwUpdate = vi.fn();

        render(<AppModalsContainer {...props} />);
        expect(screen.getByTestId("sw-update").getAttribute("data-version")).toBe("1.2.3");
        fireEvent.click(screen.getByRole("button", { name: "reload" }));
        expect(props.onReloadSwUpdate).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole("button", { name: "close-sw" }));
        expect(props.onCloseSwUpdate).toHaveBeenCalledTimes(1);
    });

    it("renders safe mode when open and wires actions", () => {
        const props = baseProps();
        props.isSafeModeOpen = true;
        props.loadReport = { status: "corrupt", recoveredFromLastGood: false };
        props.canCopyCurrentRawSave = true;
        props.canCopyLastGoodRawSave = false;

        render(<AppModalsContainer {...props} />);
        const node = screen.getByTestId("safe-mode");
        expect(node.getAttribute("data-status")).toBe("corrupt");
        expect(node.getAttribute("data-can-current")).toBe("1");
        expect(node.getAttribute("data-can-last")).toBe("0");

        fireEvent.click(screen.getByRole("button", { name: "copy-current" }));
        expect(props.onCopyCurrentRawSave).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole("button", { name: "reset" }));
        expect(props.onResetSave).toHaveBeenCalledTimes(1);
    });
});
