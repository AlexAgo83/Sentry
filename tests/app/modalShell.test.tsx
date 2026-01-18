import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalShell } from "../../src/app/components/ModalShell";

describe("ModalShell", () => {
    it("closes on backdrop click and Escape, ignores body clicks", () => {
        const onClose = vi.fn();

        render(
            <ModalShell kicker="Test" title="Modal" onClose={onClose}>
                <div>Modal body</div>
            </ModalShell>
        );

        fireEvent.click(screen.getByText("Modal body"));
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("dialog"));
        expect(onClose).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(window, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(2);
    });
});
