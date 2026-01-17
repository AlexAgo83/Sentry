import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RosterPanel } from "../../src/app/components/RosterPanel";
import { ActionStatusPanel } from "../../src/app/components/ActionStatusPanel";
import { CharacterStatsPanel } from "../../src/app/components/CharacterStatsPanel";
import { InventoryPanel } from "../../src/app/components/InventoryPanel";
import { createPlayerState } from "../../src/core/state";
import { SKILL_DEFINITIONS } from "../../src/data/definitions";
import type { SkillId } from "../../src/core/types";
import type { CSSProperties } from "react";

const buildRosterPlayers = () => {
    return [createPlayerState("1"), createPlayerState("2", "Nova")];
};

describe("panel components", () => {
    it("RosterPanel opens the loadout action", async () => {
        const user = userEvent.setup();
        const onOpenLoadout = vi.fn();

        render(
            <RosterPanel
                players={buildRosterPlayers()}
                activePlayerId="1"
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                onSetActivePlayer={vi.fn()}
                onOpenLoadout={onOpenLoadout}
                onOpenRename={vi.fn()}
                onAddPlayer={vi.fn()}
                onOpenInventory={vi.fn()}
                onOpenSystem={vi.fn()}
                getSkillLabel={() => "Combat"}
                getRecipeLabel={() => "Border Skirmish"}
            />
        );

        await user.click(screen.getAllByRole("button", { name: /Manage actions/ })[0]);
        expect(onOpenLoadout).toHaveBeenCalledWith("1");
    });

    it("ActionStatusPanel renders current action details", () => {
        render(
            <ActionStatusPanel
                activeSkillId={"Combat" as SkillId}
                activeSkillName="Combat"
                activeRecipeLabel="Border Skirmish"
                activeConsumptionLabel="1 Food"
                activeProductionLabel="1 Gold"
                resourceHint={null}
                progressPercent={45}
                progressStyle={{ "--progress": "45%" } as CSSProperties}
                staminaStyle={{ "--progress": "80%" } as CSSProperties}
                skillStyle={{ "--progress": "30%" } as CSSProperties}
                recipeStyle={{ "--progress": "50%" } as CSSProperties}
                staminaPercent={80}
                skillPercent={30}
                recipePercent={50}
                staminaCurrent={8}
                staminaMax={10}
                activeSkillLevel={2}
                activeSkillXp={20}
                activeSkillXpNext={50}
                activeRecipeLevel={1}
                activeRecipeXp={10}
                activeRecipeXpNext={20}
                isStunned={false}
                skillIconColor="#f2c14e"
            />
        );

        expect(screen.getByText("Selected skill")).toBeTruthy();
        expect(screen.getByText("Border Skirmish")).toBeTruthy();
    });

    it("CharacterStatsPanel toggles collapse", async () => {
        const user = userEvent.setup();
        const onToggleCollapsed = vi.fn();

        render(
            <CharacterStatsPanel
                skills={SKILL_DEFINITIONS}
                skillLevels={{}}
                isCollapsed={false}
                onToggleCollapsed={onToggleCollapsed}
            />
        );

        await user.click(screen.getByRole("button", { name: "Collapse" }));
        expect(onToggleCollapsed).toHaveBeenCalled();
    });

    it("InventoryPanel selects items and paginates", async () => {
        const user = userEvent.setup();
        const onSelectItem = vi.fn();
        const onPageChange = vi.fn();

        render(
            <InventoryPanel
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                entries={[
                    {
                        id: "gold",
                        name: "Gold",
                        count: 150,
                        description: "Coins",
                        iconId: "gold",
                        usedBy: [],
                        obtainedBy: ["Action: Combat"]
                    }
                ]}
                gridEntries={[
                    {
                        id: "gold",
                        name: "Gold",
                        count: 150,
                        description: "Coins",
                        iconId: "gold",
                        usedBy: [],
                        obtainedBy: ["Action: Combat"]
                    }
                ]}
                selectedItem={null}
                selectedItemId={null}
                onSelectItem={onSelectItem}
                onClearSelection={vi.fn()}
                sort="Name"
                onSortChange={vi.fn()}
                search=""
                onSearchChange={vi.fn()}
                page={1}
                pageCount={2}
                onPageChange={onPageChange}
                totalItems={1}
                emptyState="No items"
                selectionHint={null}
            />
        );

        await user.click(screen.getByRole("button", { name: "Gold x150" }));
        expect(onSelectItem).toHaveBeenCalledWith("gold");

        await user.click(screen.getByRole("button", { name: "Next" }));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });
});
