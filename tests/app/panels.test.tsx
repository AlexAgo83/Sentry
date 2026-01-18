import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RosterPanel } from "../../src/app/components/RosterPanel";
import { ActionStatusPanel } from "../../src/app/components/ActionStatusPanel";
import { CharacterStatsPanel } from "../../src/app/components/CharacterStatsPanel";
import { InventoryPanel } from "../../src/app/components/InventoryPanel";
import { EquipmentPanel } from "../../src/app/components/EquipmentPanel";
import { createPlayerState } from "../../src/core/state";
import { computeEffectiveStats, createPlayerStatsState } from "../../src/core/stats";
import { createPlayerEquipmentState } from "../../src/core/equipment";
import { SKILL_DEFINITIONS } from "../../src/data/definitions";
import { EQUIPMENT_DEFINITIONS } from "../../src/data/equipment";
import type { SkillId } from "../../src/core/types";
import type { CSSProperties } from "react";

const buildRosterPlayers = () => {
    return [createPlayerState("1"), createPlayerState("2", "Nova")];
};

describe("panel components", () => {
    it("RosterPanel selects a player on click", async () => {
        const user = userEvent.setup();
        const onSetActivePlayer = vi.fn();

        render(
            <RosterPanel
                players={buildRosterPlayers()}
                activePlayerId="1"
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                onSetActivePlayer={onSetActivePlayer}
                onAddPlayer={vi.fn()}
                getSkillLabel={() => "Combat"}
                getRecipeLabel={() => "Border Skirmish"}
            />
        );

        const playerCard = screen.getByText("Player_1").closest(".ts-player-card");
        expect(playerCard).toBeTruthy();
        if (playerCard) {
            await user.click(playerCard);
        }
        expect(onSetActivePlayer).toHaveBeenCalledWith("1");
    });

    it("ActionStatusPanel renders current action details", async () => {
        const user = userEvent.setup();
        const onChangeAction = vi.fn();

        render(
            <ActionStatusPanel
                activeSkillId={"Combat" as SkillId}
                activeSkillName="Combat"
                activeRecipeLabel="Border Skirmish"
                activeConsumptionLabel="1 Food"
                activeProductionLabel="1 Gold"
                actionDurationLabel="1.0s"
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
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                onChangeAction={onChangeAction}
                canChangeAction={true}
            />
        );

        expect(screen.getByText("Selected skill")).toBeTruthy();
        expect(screen.getByText("Border Skirmish")).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Change" }));
        expect(onChangeAction).toHaveBeenCalled();
    });

    it("CharacterStatsPanel toggles collapse", async () => {
        const user = userEvent.setup();
        const onToggleCollapsed = vi.fn();

        render(
            <CharacterStatsPanel
                skills={SKILL_DEFINITIONS}
                skillLevels={{}}
                stats={createPlayerStatsState()}
                effectiveStats={computeEffectiveStats(createPlayerStatsState())}
                equipmentMods={[]}
                now={0}
                isCollapsed={false}
                onToggleCollapsed={onToggleCollapsed}
                onRenameHero={vi.fn()}
                canRenameHero={true}
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

    it("InventoryPanel shows empty state and hint", () => {
        render(
            <InventoryPanel
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                entries={[]}
                gridEntries={[]}
                selectedItem={null}
                selectedItemId={null}
                onSelectItem={vi.fn()}
                onClearSelection={vi.fn()}
                sort="Name"
                onSortChange={vi.fn()}
                search=""
                onSearchChange={vi.fn()}
                page={1}
                pageCount={1}
                onPageChange={vi.fn()}
                totalItems={0}
                emptyState="No items available"
                selectionHint="Off-page selection"
            />
        );

        expect(screen.getByText("No items available")).toBeTruthy();
        expect(screen.getByText("Off-page selection")).toBeTruthy();
        expect(screen.queryByText(/Page 1 of 1/)).toBeNull();
    });

    it("EquipmentPanel triggers equip and unequip actions", async () => {
        const user = userEvent.setup();
        const onEquipItem = vi.fn();
        const onUnequipSlot = vi.fn();
        const equipment = createPlayerEquipmentState();
        equipment.slots.Weapon = "rusty_blade";

        render(
            <EquipmentPanel
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                equipment={equipment}
                inventoryItems={{ simple_bow: 1 }}
                definitions={EQUIPMENT_DEFINITIONS}
                onEquipItem={onEquipItem}
                onUnequipSlot={onUnequipSlot}
            />
        );

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Equip Weapon" }),
            "simple_bow"
        );
        expect(onEquipItem).toHaveBeenCalledWith("simple_bow");

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Equip Weapon" }),
            "Unequip"
        );
        expect(onUnequipSlot).toHaveBeenCalledWith("Weapon");
    });
});
