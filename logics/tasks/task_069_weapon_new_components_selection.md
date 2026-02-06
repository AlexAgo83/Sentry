## task_069_weapon_new_components_selection - Finalize new components list and mapping
> From version: 0.9.9
> Owner: —
> Status: Ready
> Understanding: 92%
> Confidence: 86%
> Progress: 0%

# Summary
Confirm the list of components not currently used in weapon recipes and map them to the new weapon tiers.

# Dependencies
- item_083_weapon_new_components_selection

# Steps
1. Confirm approved components list (v1: `herbs`, `cloth`, `stone`, `tools`, `artifact`, `tonic`).
2. Map components to each new weapon tier recipe (melee/ranged/magic).
3. Document the mapping in the backlog item and in recipe definitions.

# Decisions
- Approved list (v1): `herbs`, `cloth`, `stone`, `tools`, `artifact`, `tonic`.
- Mapping:
- Melee: `stone` (tier+1) + `ingot`, `tools` (tier+2) + `ingot`.
- Ranged: `cloth` (tier+1) + `wood`, `tools` (tier+2) + `wood`.
- Magic: `herbs` (tier+1) + `crystal`, `artifact` or `tonic` (tier+2) + `crystal`.

# Acceptance criteria
- Each new tier recipe uses one approved component.
- Mapping is documented and consistent across tiers.
