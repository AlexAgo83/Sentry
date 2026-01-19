import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SafeModeModal } from "../../src/app/components/SafeModeModal";

describe("SafeModeModal", () => {
    it("disables copy actions when data is unavailable", () => {
        const onClose = vi.fn();
        const onResetSave = vi.fn();
        const onCopyCurrentRawSave = vi.fn();
        const onCopyLastGoodRawSave = vi.fn();
        const isDev = Boolean(import.meta.env?.DEV);

        render(
            <SafeModeModal
                report={{ status: "corrupt", recoveredFromLastGood: false }}
                canCopyCurrentRawSave={false}
                canCopyLastGoodRawSave={false}
                onCopyCurrentRawSave={onCopyCurrentRawSave}
                onCopyLastGoodRawSave={onCopyLastGoodRawSave}
                onResetSave={onResetSave}
                onClose={onClose}
            />
        );

        const copyCurrent = screen.queryByText("Copy current save (raw)") as HTMLButtonElement | null;
        const copyLastGood = screen.queryByText("Copy last good (raw)") as HTMLButtonElement | null;

        if (!isDev) {
            expect(copyCurrent).toBeNull();
            expect(copyLastGood).toBeNull();
            return;
        }

        expect(copyCurrent).toBeTruthy();
        expect(copyLastGood).toBeTruthy();
        expect(copyCurrent!.disabled).toBe(true);
        expect(copyLastGood!.disabled).toBe(true);

        fireEvent.click(copyCurrent!);
        fireEvent.click(copyLastGood!);
        expect(onCopyCurrentRawSave).not.toHaveBeenCalled();
        expect(onCopyLastGoodRawSave).not.toHaveBeenCalled();
    });

    it("calls copy handlers when enabled", () => {
        const onClose = vi.fn();
        const onResetSave = vi.fn();
        const onCopyCurrentRawSave = vi.fn();
        const onCopyLastGoodRawSave = vi.fn();
        const isDev = Boolean(import.meta.env?.DEV);

        render(
            <SafeModeModal
                report={{ status: "recovered_last_good", recoveredFromLastGood: true }}
                canCopyCurrentRawSave={true}
                canCopyLastGoodRawSave={true}
                onCopyCurrentRawSave={onCopyCurrentRawSave}
                onCopyLastGoodRawSave={onCopyLastGoodRawSave}
                onResetSave={onResetSave}
                onClose={onClose}
            />
        );

        if (!isDev) {
            expect(screen.queryByText("Copy current save (raw)")).toBeNull();
            expect(screen.queryByText("Copy last good (raw)")).toBeNull();
            return;
        }

        fireEvent.click(screen.getByText("Copy current save (raw)"));
        fireEvent.click(screen.getByText("Copy last good (raw)"));

        expect(onCopyCurrentRawSave).toHaveBeenCalledTimes(1);
        expect(onCopyLastGoodRawSave).toHaveBeenCalledTimes(1);
    });
});
