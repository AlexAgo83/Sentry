## item_149_add_melee_arc_vfx_and_limit_lunge_to_melee - Add melee arc VFX and limit lunge to melee
> From version: 0.9.30
> Understanding: 90%
> Confidence: 86%
> Progress: 100%
> Complexity: Medium
> Theme: Visuals
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Melee attacks are currently communicated mainly via a lunge; we need a clear “attack” cue and to prevent ranged/magic units from lunging once their own VFX exist.

# Scope
- In:
- Render a short glowing arc in front of the attacker, oriented toward the target direction.
- Update lunge behavior so it applies only when attacker weapon type is melee:
  - `"Melee"` (and unknown/missing weaponType defaults to melee for now).
  - `"Ranged"` and `"Magic"` do not lunge.
- Ensure missing source/target units do not crash rendering.
- Out:
- No impact sparks or knockback animations.

# Acceptance criteria
- Melee attacks show an arc VFX and keep lunge.
- Ranged/magic attacks do not lunge.
- Rendering remains stable when units die quickly or are missing.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_046_dungeon_attack_vfx_arc_projectile_spell_beam.md`.
