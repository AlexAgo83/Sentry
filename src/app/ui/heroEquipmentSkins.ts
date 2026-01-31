import type { ItemId, PlayerEquipmentState } from "../../core/types";

type EquipmentSkinMap = Partial<Record<ItemId, string>>;

const EQUIPMENT_SKIN_URLS: EquipmentSkinMap = {
    traveler_cape: "/img/hero/capes/traveler_cape.svg",
    leather_gloves: "/img/hero/hands/leather_gloves.svg",
    cloth_cap: "/img/hero/heads/cloth_cap.svg",
    simple_boots: "/img/hero/feets/simple_boots.svg",
    linen_tunic: "/img/hero/torsos/linen_tunic.svg",
    worn_trousers: "/img/hero/legs/worn_trousers.svg"
};

type AvatarSkinVars = Record<string, string>;
type EquipmentSkinOptions = {
    showHelmet?: boolean;
};

export const getEquipmentSkinVars = (
    equipment?: PlayerEquipmentState | null,
    options: EquipmentSkinOptions = {}
): AvatarSkinVars => {
    if (!equipment) {
        return {};
    }
    const showHelmet = options.showHelmet ?? true;
    const vars: AvatarSkinVars = {};
    const setVar = (slot: "cape" | "head" | "torso" | "legs" | "hands" | "feets", itemId?: ItemId | null) => {
        const url = itemId ? EQUIPMENT_SKIN_URLS[itemId] : undefined;
        if (url) {
            vars[`--ts-avatar-gear-${slot}`] = `url("${url}")`;
        }
    };

    setVar("cape", equipment.slots.Cape);
    setVar("head", showHelmet ? equipment.slots.Head : null);
    setVar("torso", equipment.slots.Torso);
    setVar("legs", equipment.slots.Legs);
    setVar("hands", equipment.slots.Hands);
    setVar("feets", equipment.slots.Feet);

    if (showHelmet && equipment.slots.Head) {
        vars["--ts-avatar-hair-opacity"] = "0";
    }

    return vars;
};
