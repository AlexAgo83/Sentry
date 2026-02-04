## item_064_migrate_or_reset_save_for_skill_id_split - Reset save for skill ID split
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Problem
Skill ID split (`Combat` + `Roaming`) can break old save compatibility if legacy save shapes are loaded without a deterministic transition strategy.

# Scope
- In:
  - Apply v1 strategy: clean save reset for this split (no best-effort migration path in implementation).
  - Bump persistence version/envelope marker to invalidate incompatible pre-split saves.
  - Ensure post-reset initialization contains both `Combat` and `Roaming` skill states.
  - Add explicit user-facing messaging for reset impact.
- Out:
  - Transitional legacy migration logic (`Combat -> Roaming`) for old saves.
  - Mixed-version cloud merge support for incompatible schemas.

# Acceptance criteria
- Loading an incompatible pre-split save follows a deterministic reset path.
- Fresh state after reset includes valid `Combat` and `Roaming` skill structures.
- App does not throw runtime errors from missing legacy skill fields after reset.
- Reset behavior and rationale are documented in release notes/changelog artifacts.

# Priority
- Impact: High (stability and rollout safety).
- Urgency: High (required for clean req_019 delivery).

# Notes
- Source request: `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`
- Derived from `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`.
- Locked decision alignment: clean reset is preferred and selected for v1.
