import type { ItemId, PlayerEquipmentState } from "../../core/types";
import { getEquipmentDefinition } from "../../data/equipment";

type EquipmentSkinMap = Partial<Record<ItemId, string>>;

const EQUIPMENT_SKIN_URLS: EquipmentSkinMap = {
    traveler_cape: "/img/characters/capes/traveler-cape.svg",
    leather_gloves: "/img/characters/equipment/hands/leather-gloves.svg",
    cloth_cap: "/img/characters/equipment/head/cloth-cap.svg",
    simple_boots: "/img/characters/equipment/feet/simple-boots.svg",
    linen_tunic: "/img/characters/clothing/torso/linen-tunic.svg",
    worn_trousers: "/img/characters/clothing/legs/worn-trousers.svg"
};

const WEAPON_BASE_BODY_URLS: EquipmentSkinMap = {
    rusty_blade: "/img/characters/equipment/weapons/rusty_blade.svg",
    rusty_blade_refined: "/img/characters/equipment/weapons/rusty_blade_refined.svg",
    rusty_blade_masterwork: "/img/characters/equipment/weapons/rusty_blade_masterwork.svg",
    simple_bow: "/img/characters/equipment/weapons/simple_bow.svg",
    simple_bow_refined: "/img/characters/equipment/weapons/simple_bow_refined.svg",
    simple_bow_masterwork: "/img/characters/equipment/weapons/simple_bow_masterwork.svg",
    apprentice_staff: "/img/characters/equipment/weapons/apprentice_staff.svg",
    apprentice_staff_refined: "/img/characters/equipment/weapons/apprentice_staff_refined.svg",
    apprentice_staff_masterwork: "/img/characters/equipment/weapons/apprentice_staff_masterwork.svg"
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
    const weaponId = equipment.slots.Weapon;
    const weaponType = weaponId ? getEquipmentDefinition(weaponId)?.weaponType : undefined;
    const weaponAssetUrl = weaponId ? WEAPON_BASE_BODY_URLS[weaponId] : undefined;
    const baseBodyUrl = weaponAssetUrl ?? (weaponType
        ? `/img/characters/equipment/weapons/default_${weaponType.toLowerCase()}.svg`
        : null);
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
    if (baseBodyUrl) {
        vars["--ts-avatar-base-body"] = `url("${baseBodyUrl}")`;
    }

    return vars;
};
