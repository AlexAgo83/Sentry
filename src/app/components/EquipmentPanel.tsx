import { memo } from "react";
import type { EquipmentItemDefinition, EquipmentSlotId, ItemId, PlayerEquipmentState } from "../../core/types";
import { EQUIPMENT_SLOTS } from "../../core/equipment";
import { getInventoryMeta } from "../ui/inventoryMeta";
import { InventoryIcon, type InventoryIconId } from "../ui/inventoryIcons";
import { CollapseIcon } from "../ui/collapseIcon";

type EquipmentPanelProps = {
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    equipment: PlayerEquipmentState;
    inventoryItems: Record<ItemId, number>;
    definitions: EquipmentItemDefinition[];
    onEquipItem: (itemId: ItemId) => void;
    onUnequipSlot: (slot: EquipmentSlotId) => void;
};

const UNEQUIP_VALUE = "__unequip__";

const SLOT_ICON_IDS: Record<EquipmentSlotId, InventoryIconId> = {
    Head: "slot_head",
    Cape: "slot_cape",
    Torso: "slot_torso",
    Legs: "slot_legs",
    Hands: "slot_hands",
    Feet: "slot_feet",
    Ring: "slot_ring",
    Amulet: "slot_amulet",
    Weapon: "slot_weapon",
    Tablet: "slot_tablet"
};

const buildDefinitionMap = (definitions: EquipmentItemDefinition[]): Record<ItemId, EquipmentItemDefinition> => {
    return definitions.reduce<Record<ItemId, EquipmentItemDefinition>>((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {} as Record<ItemId, EquipmentItemDefinition>);
};

const buildAvailableBySlot = (
    definitions: EquipmentItemDefinition[],
    inventoryItems: Record<ItemId, number>
): Record<EquipmentSlotId, EquipmentItemDefinition[]> => {
    const buckets = EQUIPMENT_SLOTS.reduce<Record<EquipmentSlotId, EquipmentItemDefinition[]>>((acc, slot) => {
        acc[slot] = [];
        return acc;
    }, {} as Record<EquipmentSlotId, EquipmentItemDefinition[]>);

    definitions.forEach((item) => {
        const count = inventoryItems[item.id] ?? 0;
        if (count > 0) {
            buckets[item.slot].push(item);
        }
    });

    return buckets;
};

const formatModifiers = (modifiers: EquipmentItemDefinition["modifiers"]): string => {
    if (modifiers.length === 0) {
        return "No bonuses";
    }
    return modifiers
        .map((mod) => {
            const valueLabel = mod.kind === "mult"
                ? `${Math.round(mod.value * 100)}%`
                : `${mod.value}`;
            const prefix = mod.value > 0 ? "+" : "";
            return `${prefix}${valueLabel} ${mod.stat}`;
        })
        .join(", ");
};

export const EquipmentPanel = memo(({
    isCollapsed,
    onToggleCollapsed,
    equipment,
    inventoryItems,
    definitions,
    onEquipItem,
    onUnequipSlot
}: EquipmentPanelProps) => {
    const definitionById = buildDefinitionMap(definitions);
    const availableBySlot = buildAvailableBySlot(definitions, inventoryItems);

    return (
        <section className="generic-panel ts-panel ts-equipment-panel">
            <div className="ts-panel-header">
                <h2 className="ts-panel-title">Equipment</h2>
                <button
                    type="button"
                    className="ts-collapse-button ts-focusable"
                    onClick={onToggleCollapsed}
                    aria-label={isCollapsed ? "Expand" : "Collapse"}
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    <span className="ts-collapse-label">
                        <CollapseIcon isCollapsed={isCollapsed} />
                    </span>
                </button>
            </div>
            {!isCollapsed ? (
                <div className="ts-equipment-grid">
                    {EQUIPMENT_SLOTS.map((slot) => {
                        const equippedId = equipment.slots[slot];
                        const equippedDef = equippedId ? definitionById[equippedId] : undefined;
                        const slotLabel = slot;
                        const iconId = equippedDef
                            ? getInventoryMeta(equippedDef.id).iconId
                            : SLOT_ICON_IDS[slot];
                        const itemLabel = equippedDef ? equippedDef.name : `Empty ${slotLabel}`;
                        const modifierLabel = equippedDef ? formatModifiers(equippedDef.modifiers) : null;
                        const chargeValue = slot === "Tablet" && equippedDef ? equipment.charges[slot] : null;
                        const chargeLabel = chargeValue !== null ? `Charges: ${chargeValue}/100` : null;
                        const options = availableBySlot[slot];
                        const hasEquippedOption = equippedId
                            ? options.some((item) => item.id === equippedId)
                            : false;

                        return (
                            <div
                                key={slot}
                                className={`ts-equipment-slot${equippedDef ? "" : " is-empty"}`}
                            >
                                <div className="ts-equipment-slot-info">
                                    <div className="ts-equipment-slot-icon" aria-hidden="true">
                                        <InventoryIcon iconId={iconId} />
                                    </div>
                                    <div className="ts-equipment-slot-text">
                                        <span className="ts-equipment-slot-label">{slotLabel}</span>
                                        <span className="ts-equipment-slot-name">{itemLabel}</span>
                                        {modifierLabel ? (
                                            <span className="ts-equipment-slot-mods">{modifierLabel}</span>
                                        ) : null}
                                        {chargeLabel ? (
                                            <span className="ts-equipment-slot-charges">{chargeLabel}</span>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="ts-equipment-slot-actions">
                                    <select
                                        className="generic-field input ts-equipment-select"
                                        value={equippedId ?? ""}
                                        aria-label={`Equip ${slotLabel}`}
                                        onChange={(event) => {
                                            const itemId = event.target.value;
                                            if (!itemId) {
                                                return;
                                            }
                                            if (itemId === UNEQUIP_VALUE) {
                                                onUnequipSlot(slot);
                                                return;
                                            }
                                            onEquipItem(itemId);
                                        }}
                                        disabled={options.length === 0 && !equippedDef}
                                    >
                                        <option value="" hidden>
                                            Empty {slotLabel}
                                        </option>
                                        {equippedDef && !hasEquippedOption ? (
                                            <option value={equippedDef.id} hidden>
                                                {equippedDef.name}
                                            </option>
                                        ) : null}
                                        {equippedDef ? (
                                            <optgroup label="Actions">
                                                <option value={UNEQUIP_VALUE}>Unequip</option>
                                            </optgroup>
                                        ) : null}
                                        {options.length > 0 ? (
                                            <optgroup label="Items">
                                                {options.map((item) => {
                                                    const count = inventoryItems[item.id] ?? 0;
                                                    return (
                                                        <option key={item.id} value={item.id}>
                                                            {item.name} ({count})
                                                        </option>
                                                    );
                                                })}
                                            </optgroup>
                                        ) : null}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </section>
    );
});

EquipmentPanel.displayName = "EquipmentPanel";
