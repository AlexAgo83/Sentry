import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const invocationRecipes: RecipeDefinition[] = [
    {
        id: "inscribe_invocation_tablet",
        skillId: "Invocation",
        name: "Inscribe Invocation Tablet",
        description: "Etch a simple rune that stabilizes basic invocations.",
        unlockLevel: unlockTier(1),
        itemCosts: { stone: 6, crystal: 1 },
        itemRewards: withRewards({ invocation_tablet: 1 })
    },
    {
        id: "carve_whisper_rune",
        skillId: "Invocation",
        name: "Carve Whisper Rune",
        description: "Cut a quiet rune that carries minor echoes.",
        unlockLevel: unlockTier(5),
        itemCosts: { stone: 8, crystal: 1 },
        itemRewards: withRewards({ invocation_tablet: 1 })
    },
    {
        id: "etch_resonant_sigils",
        skillId: "Invocation",
        name: "Etch Resonant Sigils",
        description: "Layer sigils to amplify the tablet's resonance.",
        unlockLevel: unlockTier(10),
        itemCosts: { stone: 10, crystal: 2 },
        itemRewards: withRewards({ invocation_tablet: 1 })
    },
    {
        id: "bind_echo_tablet",
        skillId: "Invocation",
        name: "Bind Echo Tablet",
        description: "Lock repeating echoes into a sturdier tablet.",
        unlockLevel: unlockTier(20),
        itemCosts: { stone: 12, crystal: 3 },
        itemRewards: withRewards({ invocation_tablet: 2 })
    },
    {
        id: "carve_warded_tablet",
        skillId: "Invocation",
        name: "Carve Warded Tablet",
        description: "Reinforce the tablet with protective wards.",
        unlockLevel: unlockTier(30),
        itemCosts: { stone: 14, crystal: 4 },
        itemRewards: withRewards({ invocation_tablet: 2 })
    },
    {
        id: "inscribe_veilward_tablet",
        skillId: "Invocation",
        name: "Inscribe Veilward Tablet",
        description: "Seal a veil-bound inscription to steady the glyphs.",
        unlockLevel: unlockTier(40),
        itemCosts: { stone: 16, crystal: 5 },
        itemRewards: withRewards({ invocation_tablet: 2 })
    },
    {
        id: "imprint_starlit_tablet",
        skillId: "Invocation",
        name: "Imprint Starlit Tablet",
        description: "Infuse the tablet with a faint celestial shimmer.",
        unlockLevel: unlockTier(50),
        itemCosts: { stone: 18, crystal: 6 },
        itemRewards: withRewards({ invocation_tablet: 3 })
    },
    {
        id: "forge_ancient_tablet",
        skillId: "Invocation",
        name: "Forge Ancient Tablet",
        description: "Anchor the runes with an ancient artifact core.",
        unlockLevel: unlockTier(60),
        itemCosts: { stone: 20, crystal: 7, artifact: 1 },
        itemRewards: withRewards({ invocation_tablet: 3 })
    },
    {
        id: "inscribe_astral_tablet",
        skillId: "Invocation",
        name: "Inscribe Astral Tablet",
        description: "Trace astral lines for a brighter invocation lattice.",
        unlockLevel: unlockTier(70),
        itemCosts: { stone: 22, crystal: 8, artifact: 1 },
        itemRewards: withRewards({ invocation_tablet: 4 })
    },
    {
        id: "inscribe_sanctum_tablet",
        skillId: "Invocation",
        name: "Inscribe Sanctum Tablet",
        description: "Complete a sanctum-grade tablet for masterwork rites.",
        unlockLevel: unlockTier(80),
        itemCosts: { stone: 24, crystal: 10, artifact: 2 },
        itemRewards: withRewards({ invocation_tablet: 5 })
    }
];
