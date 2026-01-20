import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmSellModal } from "../../src/app/components/ConfirmSellModal";

describe("ConfirmSellModal", () => {
    it("renders nothing when closed", () => {
        render(
            <ConfirmSellModal
                isOpen={false}
                itemName="Meat"
                count={2}
                goldGain={4}
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );

        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("shows modal copy and triggers callbacks", () => {
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        const { unmount } = render(
            <ConfirmSellModal
                isOpen={true}
                itemName="Meat"
                count={2}
                goldGain={4}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );

        expect(screen.getByText("Confirm sale")).toBeTruthy();
        expect(screen.getByText((_, element) => {
            if (!element || !element.classList.contains("ts-modal-copy")) {
                return false;
            }
            const text = element.textContent ?? "";
            return text.includes("Sell") && text.includes("x2") && text.includes("Meat") && text.includes("+4 gold");
        })).toBeTruthy();
        expect(document.documentElement.classList.contains("ts-any-modal-open")).toBe(true);

        fireEvent.click(screen.getByRole("button", { name: "Sell" }));
        expect(onConfirm).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onCancel).toHaveBeenCalledTimes(1);

        unmount();
        expect(document.documentElement.classList.contains("ts-any-modal-open")).toBe(false);
    });
});
