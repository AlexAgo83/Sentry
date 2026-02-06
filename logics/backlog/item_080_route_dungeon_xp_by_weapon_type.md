## item_080_route_dungeon_xp_by_weapon_type - Route dungeon XP by weapon type
> From version: 0.9.9
> Understanding: 94%
> Confidence: 90%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Dungeon combat XP must be routed to the correct combat skill based on weapon category.

# Scope
- In:
- Route dungeon combat XP to Melee/Ranged/Magic based on equipped weapon `WeaponType`.
- Ensure offline/replay determinism with the new routing.
- Out:
- No changes to non-dungeon XP sources.

# Decisions
- Weapon type is the sole XP router.
- Missing weapon defaults to Melee.
- If weapon changes mid-run, XP routing updates immediately.

# Acceptance criteria
- Dungeon combat XP accrues to the correct skill for each hero.
- Deterministic outcomes between offline and live simulation are preserved.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_025_split_combat_xp_by_weapon_type.md`.
