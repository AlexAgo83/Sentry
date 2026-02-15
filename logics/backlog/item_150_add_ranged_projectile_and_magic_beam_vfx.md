## item_150_add_ranged_projectile_and_magic_beam_vfx - Add ranged projectile and magic beam VFX
> From version: 0.9.30
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Visuals
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Ranged and magic attacks need distinct, readable cues that communicate direction/targeting without relying on unit movement.

# Scope
- In:
- Ranged:
  - render a projectile that travels from attacker to target over a short duration.
- Magic:
  - render a translucent glowing beam/line that appears briefly and fades out.
- Ensure effects are time-based off `frame.atMs` and obey concurrency caps.
- Out:
- No per-spell variations (single beam style in v1).
- No complex trails/particles.

# Acceptance criteria
- Ranged attacks show a projectile that reaches the target quickly and fades out.
- Magic attacks show a brief glowing beam and fades out.
- Effects do not persist and reuse pooled nodes.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_046_dungeon_attack_vfx_arc_projectile_spell_beam.md`.
