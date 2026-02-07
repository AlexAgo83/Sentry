## task_070_weapon_tier_tooltips_and_ui - Show new tiers in crafting and tooltips
> From version: 0.9.9
> Owner: —
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Summary
Expose new weapon tiers in the crafting UI and item tooltips, including the new component callout.

# Dependencies
- item_084_weapon_tier_tooltips_and_ui
- task_068_weapon_tier_definitions_and_recipes

# Steps
1. Ensure new tiers appear in crafting lists in `src/data/definitions/recipes/index.ts` ordering.
2. Update `src/app/ui/inventoryMeta.ts` tooltip content for new tiers.
3. Add a “New component: <ItemName>” line to the tooltip.

# Decisions
- Show “New component: <ItemName>” in both recipe tooltip and item detail tooltip.
- Order tiers strictly by unlock level.

# Acceptance criteria
- Crafting list shows the new tiers in unlock order.
- Tooltip includes the new component line.
