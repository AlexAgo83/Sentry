## task_068_weapon_tier_definitions_and_recipes - Add two tiers per weapon item
> From version: 0.9.9
> Owner: —
> Status: Ready
> Understanding: 86%
> Confidence: 78%
> Progress: 0%

# Summary
Define and add two higher-tier variants for each existing weapon item, plus recipes and balancing adjustments.

# Dependencies
- item_082_weapon_tier_definitions_and_recipes
- item_083_weapon_new_components_selection

# Steps
1. Add new weapon items for each base weapon (tier+1, tier+2) in `src/data/equipment.ts`.
2. Add recipes for the new tiers in `src/data/definitions/recipes/carpentry.ts` and `src/data/definitions/recipes/metalwork.ts`.
3. Update `src/data/definitions/items.ts` and `src/app/ui/inventoryMeta.ts` for new items.
4. Validate unlock tiers and crafting costs.
5. Update tests if any item lists are referenced.

# Acceptance criteria
- New weapon tiers are craftable and appear in item lists.
- Each recipe uses a “new-for-weapons” component + a classic weapon component.
- Stat scaling matches +1 primary stat per tier.

# Notes
- Use naming pattern: `Refined` / `Masterwork`.
