import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
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

        fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);
        expect(onClose).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(window, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it("sets focus on open, traps Tab focus, and restores focus on close", async () => {
        const user = userEvent.setup();

        const Harness = () => {
            const [open, setOpen] = useState(false);
            return (
                <>
                    <button type="button" onClick={() => setOpen(true)}>Open modal</button>
                    <button type="button">Outside control</button>
                    {open ? (
                        <ModalShell kicker="Test" title="Modal" onClose={() => setOpen(false)}>
                            <button type="button">Confirm action</button>
                        </ModalShell>
                    ) : null}
                </>
            );
        };

        render(<Harness />);

        const opener = screen.getByRole("button", { name: "Open modal" });
        await user.click(opener);

        const dialog = screen.getByRole("dialog");
        const closeButton = screen.getByRole("button", { name: "Close" });
        const confirmButton = screen.getByRole("button", { name: "Confirm action" });

        expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
        expect(document.activeElement).toBe(closeButton);

        await user.tab();
        expect(document.activeElement).toBe(confirmButton);

        await user.tab();
        expect(document.activeElement).toBe(closeButton);

        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(opener);
    });
});
