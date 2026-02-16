import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const invocationRecipes: RecipeDefinition[] = [
    {
        id: "inscribe_invocation_tablet",
        skillId: "Invocation",
        name: "Inscribe Forgebound Tablet",
        description: "Etch a force-binding rune into stone. Grants Strength.",
        unlockLevel: unlockTier(1),
        itemCosts: { stone: 6, crystal: 1 },
        itemRewards: withRewards({ forgebound_tablet: 1 })
    },
    {
        id: "carve_whisper_rune",
        skillId: "Invocation",
        name: "Carve Forgebound Tablet",
        description: "Deepen the binding lines to reinforce raw power. Grants Strength.",
        unlockLevel: unlockTier(5),
        itemCosts: { stone: 8, crystal: 1 },
        itemRewards: withRewards({ forgebound_tablet: 2 })
    },
    {
        id: "etch_resonant_sigils",
        skillId: "Invocation",
        name: "Etch Nightveil Tablet",
        description: "Layer swift sigils that sharpen motion. Grants Agility.",
        unlockLevel: unlockTier(10),
        itemCosts: { stone: 10, crystal: 2 },
        itemRewards: withRewards({ nightveil_tablet: 1 })
    },
    {
        id: "bind_echo_tablet",
        skillId: "Invocation",
        name: "Bind Nightveil Tablet",
        description: "Bind repeating echoes to quicken the bearer. Grants Agility.",
        unlockLevel: unlockTier(20),
        itemCosts: { stone: 12, crystal: 3 },
        itemRewards: withRewards({ nightveil_tablet: 2 })
    },
    {
        id: "carve_warded_tablet",
        skillId: "Invocation",
        name: "Carve Starlit Sigil Tablet",
        description: "Carve a sigil lattice that steadies thought. Grants Intellect.",
        unlockLevel: unlockTier(30),
        itemCosts: { stone: 14, crystal: 4 },
        itemRewards: withRewards({ starlit_sigil_tablet: 1 })
    },
    {
        id: "inscribe_veilward_tablet",
        skillId: "Invocation",
        name: "Inscribe Starlit Sigil Tablet",
        description: "Seal a veil-bound inscription to sharpen the mind. Grants Intellect.",
        unlockLevel: unlockTier(40),
        itemCosts: { stone: 16, crystal: 5 },
        itemRewards: withRewards({ starlit_sigil_tablet: 2 })
    },
    {
        id: "imprint_starlit_tablet",
        skillId: "Invocation",
        name: "Imprint Stoneward Tablet",
        description: "Imprint steady wards that harden resolve. Grants Endurance.",
        unlockLevel: unlockTier(50),
        itemCosts: { stone: 18, crystal: 6 },
        itemRewards: withRewards({ stoneward_tablet: 1 })
    },
    {
        id: "forge_ancient_tablet",
        skillId: "Invocation",
        name: "Forge Stoneward Tablet",
        description: "Anchor the wards with an artifact core. Grants Endurance.",
        unlockLevel: unlockTier(60),
        itemCosts: { stone: 20, crystal: 7, artifact: 1 },
        itemRewards: withRewards({ stoneward_tablet: 2 })
    }
];
