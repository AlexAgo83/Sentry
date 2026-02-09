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
import { RECIPE_MAX_LEVEL, SKILL_MAX_LEVEL } from "../../src/core/constants";
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
                activeDungeonPartyPlayerIds={[]}
                rosterLimit={3}
                isCollapsed={false}
                showCollapseButton
                showSettingsButton={false}
                onToggleCollapsed={vi.fn()}
                onSetActivePlayer={onSetActivePlayer}
                onAddPlayer={vi.fn()}
                onOpenSystem={vi.fn()}
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
        const onInterruptAction = vi.fn();

        render(
            <ActionStatusPanel
                activeSkillId={"CombatMelee" as SkillId}
                activeSkillName="Combat - Melee"
                activeRecipeLabel="Border Skirmish"
                activeConsumptionLabel="1 Food"
                activeProductionLabel="1 Gold"
                activeConsumptionEntries={[]}
                activeProductionEntries={[]}
                actionSpeedBonusLabel="None"
                actionSpeedBonusTooltip="Speed tooltip"
                actionDurationLabel="1.0s"
                actionXpLabel="Skill +1 / Recipe +2"
                actionXpBonusLabel="None"
                actionXpBonusTooltip="XP tooltip"
                stunTimeLabel={null}
                resourceHint={null}
                staminaStyle={{ "--progress": "80%" } as CSSProperties}
                skillStyle={{ "--progress": "30%" } as CSSProperties}
                recipeStyle={{ "--progress": "50%" } as CSSProperties}
                staminaCurrent={8}
                staminaMax={10}
                activeSkillLevel={2}
                activeSkillXp={Number.NaN}
                activeSkillXpNext={Number.POSITIVE_INFINITY}
                activeRecipeLevel={1}
                activeRecipeXp={Number.NaN}
                activeRecipeXpNext={Number.NaN}
                activeSkillMax={SKILL_MAX_LEVEL}
                activeRecipeMax={RECIPE_MAX_LEVEL}
                skillIconColor="#f2c14e"
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                onChangeAction={onChangeAction}
                canChangeAction={true}
                onInterruptAction={onInterruptAction}
                canInterruptAction={true}
            />
        );

        expect(screen.getByText("Selected skill")).toBeTruthy();
        expect(screen.getByText("Border Skirmish")).toBeTruthy();
        expect(screen.getByText(`Skill Lv 2/${SKILL_MAX_LEVEL}`)).toBeTruthy();
        expect(screen.getByText(`Recipe Lv 1/${RECIPE_MAX_LEVEL}`)).toBeTruthy();
        expect(screen.getAllByText("XP 0/0")).toHaveLength(2);

        await user.click(screen.getByRole("button", { name: "Change" }));
        expect(onChangeAction).toHaveBeenCalled();
    });

    it("ActionStatusPanel shows resource hints", () => {
        const onInterruptAction = vi.fn();
        render(
            <ActionStatusPanel
                activeSkillId={"CombatMelee" as SkillId}
                activeSkillName="Combat - Melee"
                activeRecipeLabel="Border Skirmish"
                activeConsumptionLabel="1 Food"
                activeProductionLabel="1 Gold"
                activeConsumptionEntries={[]}
                activeProductionEntries={[]}
                actionSpeedBonusLabel="None"
                actionSpeedBonusTooltip="Speed tooltip"
                actionDurationLabel="1.0s"
                actionXpLabel="Skill +1 / Recipe +2"
                actionXpBonusLabel="None"
                actionXpBonusTooltip="XP tooltip"
                stunTimeLabel={null}
                resourceHint="Missing: Food x1"
                staminaStyle={{ "--progress": "80%" } as CSSProperties}
                skillStyle={{ "--progress": "30%" } as CSSProperties}
                recipeStyle={{ "--progress": "50%" } as CSSProperties}
                staminaCurrent={8}
                staminaMax={10}
                activeSkillLevel={2}
                activeSkillXp={1}
                activeSkillXpNext={2}
                activeRecipeLevel={1}
                activeRecipeXp={1}
                activeRecipeXpNext={2}
                activeSkillMax={SKILL_MAX_LEVEL}
                activeRecipeMax={RECIPE_MAX_LEVEL}
                skillIconColor="#f2c14e"
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                onChangeAction={vi.fn()}
                canChangeAction={true}
                onInterruptAction={onInterruptAction}
                canInterruptAction={true}
            />
        );

        expect(screen.getByText("Missing: Food x1")).toBeTruthy();
    });

    it("ActionStatusPanel hides details when collapsed", () => {
        render(
            <ActionStatusPanel
                activeSkillId={"CombatMelee" as SkillId}
                activeSkillName="Combat - Melee"
                activeRecipeLabel="Border Skirmish"
                activeConsumptionLabel="1 Food"
                activeProductionLabel="1 Gold"
                activeConsumptionEntries={[]}
                activeProductionEntries={[]}
                actionSpeedBonusLabel="None"
                actionSpeedBonusTooltip="Speed tooltip"
                actionDurationLabel="1.0s"
                actionXpLabel="Skill +1 / Recipe +2"
                actionXpBonusLabel="None"
                actionXpBonusTooltip="XP tooltip"
                stunTimeLabel={null}
                resourceHint={null}
                staminaStyle={{ "--progress": "80%" } as CSSProperties}
                skillStyle={{ "--progress": "30%" } as CSSProperties}
                recipeStyle={{ "--progress": "50%" } as CSSProperties}
                staminaCurrent={8}
                staminaMax={10}
                activeSkillLevel={2}
                activeSkillXp={20}
                activeSkillXpNext={50}
                activeRecipeLevel={1}
                activeRecipeXp={10}
                activeRecipeXpNext={20}
                activeSkillMax={SKILL_MAX_LEVEL}
                activeRecipeMax={RECIPE_MAX_LEVEL}
                skillIconColor="#f2c14e"
                isCollapsed={true}
                onToggleCollapsed={vi.fn()}
                onChangeAction={vi.fn()}
                canChangeAction={true}
                onInterruptAction={vi.fn()}
                canInterruptAction={true}
            />
        );

        expect(screen.queryByText("Selected skill")).toBeNull();
        expect(screen.getByRole("button", { name: "Expand" })).toBeTruthy();
    });

    it("CharacterStatsPanel toggles collapse", async () => {
        const user = userEvent.setup();
        const onToggleCollapsed = vi.fn();

        render(
            <CharacterStatsPanel
                skills={SKILL_DEFINITIONS}
                skillLevels={{}}
                skillProgress={{}}
                stats={createPlayerStatsState()}
                effectiveStats={computeEffectiveStats(createPlayerStatsState())}
                equipmentMods={[]}
                now={0}
                isCollapsed={false}
                onToggleCollapsed={onToggleCollapsed}
            />
        );

        await user.click(screen.getByRole("button", { name: "Collapse" }));
        expect(onToggleCollapsed).toHaveBeenCalled();
    });

    it("CharacterStatsPanel includes gear breakdown in tooltips and formats buff timers", () => {
        const stats = createPlayerStatsState();
        stats.base.Strength = 1.5;
        stats.permanentMods.push({
            id: "perm-1",
            stat: "Strength",
            kind: "flat",
            value: 2,
            source: "Training"
        });
        const now = 1000;
        stats.temporaryMods.push(
            {
                id: "temp-seconds",
                stat: "Strength",
                kind: "mult",
                value: 0.1,
                source: "Potion",
                expiresAt: now + 59000
            },
            {
                id: "temp-minutes",
                stat: "Agility",
                kind: "flat",
                value: 1,
                source: "Elixir",
                expiresAt: now + 60000
            },
            {
                id: "temp-hours",
                stat: "Luck",
                kind: "flat",
                value: 1,
                source: "Charm",
                expiresAt: now + 3600000
            }
        );

        render(
            <CharacterStatsPanel
                skills={SKILL_DEFINITIONS}
                skillLevels={{}}
                skillProgress={{}}
                stats={stats}
                effectiveStats={computeEffectiveStats(stats)}
                equipmentMods={[{
                    id: "gear-1",
                    stat: "Strength",
                    kind: "flat",
                    value: 1,
                    source: "Rusty Blade"
                }]}
                now={now}
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
            />
        );

        const strengthLabel = screen.getByText("Strength");
        const strengthRow = strengthLabel.closest(".ts-attribute-row");
        expect(strengthRow?.getAttribute("title")).toContain("Gear:");
        expect(strengthRow?.getAttribute("title")).toContain("Perm: +2");
        expect(strengthRow?.getAttribute("title")).toContain("Temp: +10%");

        expect(screen.getByText(/1\.5 \+3 \+10%/)).toBeTruthy();
        expect(screen.getByText(/Potion Strength 59s/)).toBeTruthy();
        expect(screen.getByText(/Elixir Agility 1m/)).toBeTruthy();
        expect(screen.getByText(/Charm Luck 1h/)).toBeTruthy();
    });

    it("CharacterStatsPanel omits gear tooltip section when no equipment modifiers exist", () => {
        const stats = createPlayerStatsState();
        render(
            <CharacterStatsPanel
                skills={SKILL_DEFINITIONS}
                skillLevels={{}}
                skillProgress={{}}
                stats={stats}
                effectiveStats={computeEffectiveStats(stats)}
                equipmentMods={[]}
                now={0}
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
            />
        );

        const strengthRow = screen.getByText("Strength").closest(".ts-attribute-row");
        expect(strengthRow?.getAttribute("title")).not.toContain("Gear:");
    });

    it("CharacterStatsPanel ignores invalid modifiers and formats non-finite values as zero", () => {
        const stats = createPlayerStatsState();
        stats.base.Strength = Number.NaN;
        stats.permanentMods.push({
            id: "invalid",
            stat: "NotAStat" as any,
            kind: "flat",
            value: 999,
            source: "Broken"
        });

        render(
            <CharacterStatsPanel
                skills={SKILL_DEFINITIONS}
                skillLevels={{}}
                skillProgress={{}}
                stats={stats}
                effectiveStats={computeEffectiveStats(stats)}
                equipmentMods={[]}
                now={0}
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
            />
        );

        const strengthRow = screen.getByText("Strength").closest(".ts-attribute-row");
        expect(strengthRow).toBeTruthy();
        expect(strengthRow?.textContent).toContain("0 +0");
    });

    it("CharacterStatsPanel renders combat breakdown values", () => {
        const stats = createPlayerStatsState();
        stats.base.Strength = 5;
        stats.base.Agility = 5;

        render(
            <CharacterStatsPanel
                skills={SKILL_DEFINITIONS}
                skillLevels={{ CombatMelee: 10, CombatRanged: 5, CombatMagic: 3 }}
                skillProgress={{}}
                stats={stats}
                effectiveStats={computeEffectiveStats(stats)}
                equipmentMods={[]}
                now={0}
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
            />
        );

        expect(screen.getByText("Combat Level")).toBeTruthy();
        expect(screen.getByText("Attack cadence")).toBeTruthy();
        expect(screen.getByText("Attacks/sec")).toBeTruthy();
        expect(screen.getByText("Damage")).toBeTruthy();
        expect(screen.getAllByText("455ms").length).toBeGreaterThan(0);
        expect(screen.getAllByText("2.20").length).toBeGreaterThan(0);
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
                        obtainedBy: ["Action: Roaming"]
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
                        obtainedBy: ["Action: Roaming"]
                    }
                ]}
                selectedItem={null}
                selectedItemId={null}
                selectedItemCharges={null}
                onSelectItem={onSelectItem}
                onClearSelection={vi.fn()}
                sellQuantity={1}
                onSellQuantityChange={vi.fn()}
                onSellSelected={vi.fn()}
                canSellSelected={false}
                sellGoldGain={0}
                unitValue={0}
                sellDisabledReason={null}
                onSellAll={vi.fn()}
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
                selectedItemCharges={null}
                onSelectItem={vi.fn()}
                onClearSelection={vi.fn()}
                sellQuantity={1}
                onSellQuantityChange={vi.fn()}
                onSellSelected={vi.fn()}
                canSellSelected={false}
                sellGoldGain={0}
                unitValue={0}
                sellDisabledReason={null}
                onSellAll={vi.fn()}
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

    it("InventoryPanel shows tablet charges for equipped items", () => {
        render(
            <InventoryPanel
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                entries={[]}
                gridEntries={[]}
                selectedItem={{
                    id: "invocation_tablet",
                    name: "Invocation Tablet",
                    count: 1,
                    description: "Stone tablet etched with invocation sigils.",
                    iconId: "invocation_tablet",
                    usedBy: [],
                    obtainedBy: []
                }}
                selectedItemId="invocation_tablet"
                selectedItemCharges={80}
                onSelectItem={vi.fn()}
                onClearSelection={vi.fn()}
                sellQuantity={1}
                onSellQuantityChange={vi.fn()}
                onSellSelected={vi.fn()}
                canSellSelected={false}
                sellGoldGain={0}
                unitValue={0}
                sellDisabledReason={null}
                onSellAll={vi.fn()}
                sort="Name"
                onSortChange={vi.fn()}
                search=""
                onSearchChange={vi.fn()}
                page={1}
                pageCount={1}
                onPageChange={vi.fn()}
                totalItems={0}
                emptyState="No items available"
                selectionHint={null}
            />
        );

        expect(screen.getByText("Charges")).toBeTruthy();
        expect(screen.getByText("80/100")).toBeTruthy();
    });

    it("InventoryPanel renders sell actions in the item detail area", () => {
        const { container } = render(
            <InventoryPanel
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                entries={[]}
                gridEntries={[]}
                selectedItem={{
                    id: "cloth_cap",
                    name: "Cloth Cap",
                    count: 3,
                    description: "A basic cap.",
                    iconId: "cloth_cap",
                    usedBy: [],
                    obtainedBy: ["Tailoring"]
                }}
                selectedItemId="cloth_cap"
                selectedItemCharges={null}
                onSelectItem={vi.fn()}
                onClearSelection={vi.fn()}
                sellQuantity={1}
                onSellQuantityChange={vi.fn()}
                onSellSelected={vi.fn()}
                canSellSelected={true}
                sellGoldGain={7}
                unitValue={7}
                sellDisabledReason={null}
                onSellAll={vi.fn()}
                sort="Name"
                onSortChange={vi.fn()}
                search=""
                onSearchChange={vi.fn()}
                page={1}
                pageCount={1}
                onPageChange={vi.fn()}
                totalItems={0}
                emptyState="No items available"
                selectionHint={null}
            />
        );

        const panelHeader = container.querySelector(".ts-panel-header");
        expect(panelHeader?.querySelector("[data-testid='inventory-sell']")).toBeNull();
        expect(panelHeader?.querySelector("[data-testid='inventory-sell-all']")).toBeNull();
        expect(screen.getByTestId("inventory-sell")).toBeTruthy();
        expect(screen.getByTestId("inventory-sell-all")).toBeTruthy();
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

    it("EquipmentPanel shows tablet charges in the slot", () => {
        const equipment = createPlayerEquipmentState();
        equipment.slots.Tablet = "invocation_tablet";
        equipment.charges.Tablet = 42;

        render(
            <EquipmentPanel
                isCollapsed={false}
                onToggleCollapsed={vi.fn()}
                equipment={equipment}
                inventoryItems={{}}
                definitions={EQUIPMENT_DEFINITIONS}
                onEquipItem={vi.fn()}
                onUnequipSlot={vi.fn()}
            />
        );

        expect(screen.getByText("Charges: 42/100")).toBeTruthy();
    });
});
