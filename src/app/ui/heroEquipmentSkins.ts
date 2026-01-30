import type { ItemId, PlayerEquipmentState } from "../../core/types";

type EquipmentSkinMap = Partial<Record<ItemId, string>>;

const EQUIPMENT_SKIN_URLS: EquipmentSkinMap = {
    traveler_cape: "/assets/hero/capes/traveler_cape.svg",
    leather_gloves: "/assets/hero/hands/leather_gloves.svg",
    cloth_cap: "/assets/hero/heads/cloth_cap.svg",
    simple_boots: "/assets/hero/feets/simple_boots.svg",
    linen_tunic: "/assets/hero/torsos/linen_tunic.svg",
    worn_trousers: "/assets/hero/legs/worn_trousers.svg"
};

type AvatarSkinVars = Record<string, string>;

export const getEquipmentSkinVars = (equipment?: PlayerEquipmentState | null): AvatarSkinVars => {
    if (!equipment) {
        return {};
    }
    const vars: AvatarSkinVars = {};
    const setVar = (slot: "cape" | "head" | "torso" | "legs" | "hands" | "feets", itemId?: ItemId | null) => {
        const url = itemId ? EQUIPMENT_SKIN_URLS[itemId] : undefined;
        if (url) {
            vars[`--ts-avatar-gear-${slot}`] = `url("${url}")`;
        }
    };

    setVar("cape", equipment.slots.Cape);
    setVar("head", equipment.slots.Head);
    setVar("torso", equipment.slots.Torso);
    setVar("legs", equipment.slots.Legs);
    setVar("hands", equipment.slots.Hands);
    setVar("feets", equipment.slots.Feet);

    if (equipment.slots.Head) {
        vars["--ts-avatar-hair-opacity"] = "0";
    }

    return vars;
};
