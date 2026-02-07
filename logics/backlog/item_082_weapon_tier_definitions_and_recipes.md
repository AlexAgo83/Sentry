## item_082_weapon_tier_definitions_and_recipes - Add two tiers per weapon item
> From version: 0.9.9
> Understanding: 94%
> Confidence: 91%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Weapon progression ends too early. We need two additional tiers per existing weapon item with new recipes.

# Scope
- In:
- Add two higher-tier variants for each existing weapon item.
- Add crafting recipes for the new tiers.
- Use a mix of one existing weapon component and one component not previously used in weapon recipes.
- Out:
- No new weapon types beyond Melee/Ranged/Magic.
- No new skill systems or UI rework.

# Decisions
- +2 tiers per existing weapon item (not just per weapon type).
- Unlock levels: tier+1 at `unlockTier(20)`, tier+2 at `unlockTier(30)`.
- Stat scaling: +1 primary stat per tier (same stat as base weapon).
- Each recipe must include at least one “new-for-weapons” component.
- Weapon items to extend (v1): `rusty_blade`, `simple_bow`, `apprentice_staff`.
- Naming pattern: `{Refined|Masterwork} <base name>` for tier+1 / tier+2.

# Acceptance criteria
- Every current weapon item has two new tiers defined.
- New recipes exist and are craftable at the specified unlock tiers.
- Each new recipe uses one component not previously used in weapon recipes.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_027_weapon_tiers_and_new_components.md`.
