## item_064_migrate_or_reset_save_for_skill_id_split - Reset save for skill ID split
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Problem
Skill ID split (`Combat` + `Roaming`) can break old save compatibility if legacy save shapes are loaded without a deterministic transition strategy.

# Scope
- In:
  - Apply deterministic split transition for legacy saves.
  - Detect pre-split save shape and reset only split skills (`Combat` + `Roaming`).
  - Preserve non-split save data (`inventory`, other skills, roster, dungeon, progression, etc.).
  - Remap legacy `selectedActionId: Combat` to `Roaming`.
- Out:
  - Full-save wipe.
  - Mixed-version cloud merge support for incompatible schemas.

# Acceptance criteria
- Loading an incompatible pre-split save follows a deterministic split-skill reset path.
- Hydrated state includes valid `Combat` and `Roaming` skill structures.
- App does not throw runtime errors from missing legacy skill fields after reset.
- Transition behavior and rationale are documented in logics artifacts.

# Priority
- Impact: High (stability and rollout safety).
- Urgency: High (required for clean req_019 delivery).

# Notes
- Source request: `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`
- Derived from `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`.
- Implemented with selective split-skill reset + action remap during hydration.
