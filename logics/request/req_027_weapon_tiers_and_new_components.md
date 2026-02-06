## req_027_weapon_tiers_and_new_components - Add two weapon tiers per weapon
> From version: 0.9.9
> Understanding: 84%
> Confidence: 76%

# Needs
- Add 2 new tiers for each weapon type.
- Use components that are not currently used in weapon recipes.

# Context
- Weapon progression needs additional tiers to extend build depth.
- New tiers should diversify resource usage by introducing underused components.

# Goals
- Expand weapon progression with two additional tiers per weapon.
- Increase crafting variety by introducing new components in recipes.
- Keep balance consistent with existing tier scaling.

# Locked decisions (v1)
- +2 tiers per existing weapon item (not just per type).
- Recipes must include components not previously used in weapon recipes.
- Each new tier recipe mixes 1 “new-for-weapons” component + 1 existing weapon component.
- Unlock levels: new tier +1 at `unlockTier(20)`, new tier +2 at `unlockTier(30)`.
- Scaling: +1 primary stat per tier (same stat as the base weapon).

# Scope detail (draft)
- Data:
  - Add new weapon definitions for each existing weapon with two higher tiers.
  - Add new recipes for the new tiers with mixed components.
- Economy:
  - Ensure component availability matches progression pacing.
  - Avoid blocking early game progression.
- UI:
  - Show new tiers in crafting lists and item details.

# Technical references to update
- `src/data/definitions/items.ts`
- `src/data/definitions/recipes/index.ts`
- `src/data/definitions/equipment.ts`
- `src/app/ui/inventoryMeta.ts`

# Acceptance criteria
- Each weapon has two additional tiers available for crafting.
- New tiers use at least one component not previously used in weapon recipes.
- Crafting UI shows the new tiers and their recipes correctly.

# Risks / open points
- Pick the exact “new-for-weapons” component list (e.g. herbs, fish, cloth, stone, tools, artifact, tonic, elixir, potion, meat, bones).

# Backlog
- To be split after approval.
