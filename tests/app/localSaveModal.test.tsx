import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalSaveModal } from "../../src/app/components/LocalSaveModal";

describe("LocalSaveModal", () => {
    it("shows clipboard feedback after successful export", async () => {
        render(
            <LocalSaveModal
                onExportSave={vi.fn(async () => "clipboard")}
                onImportSave={vi.fn()}
                onResetSave={vi.fn()}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Export save" }));
        expect(await screen.findByTestId("local-export-feedback")).toBeTruthy();
    });

    it("does not show clipboard feedback when export falls back to prompt", async () => {
        render(
            <LocalSaveModal
                onExportSave={vi.fn(async () => "prompt")}
                onImportSave={vi.fn()}
                onResetSave={vi.fn()}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Export save" }));
        await Promise.resolve();
        expect(screen.queryByTestId("local-export-feedback")).toBeNull();
    });
});
