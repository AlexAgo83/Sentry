## item_083_weapon_new_components_selection - Choose new components for weapon tiers
> From version: 0.9.9
> Understanding: 94%
> Confidence: 90%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
New weapon tiers must use components not already used in weapon recipes, but we need to select which components and keep balance.

# Scope
- In:
- Identify the “new-for-weapons” components list.
- Assign components to each new weapon tier recipe.
- Validate availability and pacing (no early-game blockers).
- Out:
- No new item definitions beyond current inventory.

# Decisions
- Components must already exist in the game.
- Recipes mix 1 new-for-weapons component + 1 existing weapon component.
- Approved “new-for-weapons” components (v1): `herbs`, `cloth`, `stone`, `tools`, `artifact`, `tonic`.
- Mapping suggestion:
- Melee tiers use `stone` (tier+1) and `tools` (tier+2) with `ingot`.
- Ranged tiers use `cloth` (tier+1) and `tools` (tier+2) with `wood`.
- Magic tiers use `herbs` (tier+1) and `artifact` or `tonic` (tier+2) with `crystal`.

# Acceptance criteria
- Approved component list documented for weapon tiers.
- Each new weapon tier recipe uses at least one approved component.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_027_weapon_tiers_and_new_components.md`.
