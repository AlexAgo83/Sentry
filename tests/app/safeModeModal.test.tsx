import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SafeModeModal } from "../../src/app/components/SafeModeModal";

describe("SafeModeModal", () => {
    it("disables copy actions when data is unavailable", () => {
        const onClose = vi.fn();
        const onResetSave = vi.fn();
        const onCopyCurrentRawSave = vi.fn();
        const onCopyLastGoodRawSave = vi.fn();

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

        const copyCurrent = screen.getByText("Copy current save (raw)") as HTMLButtonElement;
        const copyLastGood = screen.getByText("Copy last good (raw)") as HTMLButtonElement;

        expect(copyCurrent.disabled).toBe(true);
        expect(copyLastGood.disabled).toBe(true);

        fireEvent.click(copyCurrent);
        fireEvent.click(copyLastGood);
        expect(onCopyCurrentRawSave).not.toHaveBeenCalled();
        expect(onCopyLastGoodRawSave).not.toHaveBeenCalled();
    });

    it("calls copy handlers when enabled", () => {
        const onClose = vi.fn();
        const onResetSave = vi.fn();
        const onCopyCurrentRawSave = vi.fn();
        const onCopyLastGoodRawSave = vi.fn();

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

        fireEvent.click(screen.getByText("Copy current save (raw)"));
        fireEvent.click(screen.getByText("Copy last good (raw)"));

        expect(onCopyCurrentRawSave).toHaveBeenCalledTimes(1);
        expect(onCopyLastGoodRawSave).toHaveBeenCalledTimes(1);
    });
});

