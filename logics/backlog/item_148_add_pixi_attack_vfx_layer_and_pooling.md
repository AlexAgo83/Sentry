## item_148_add_pixi_attack_vfx_layer_and_pooling - Add Pixi attack VFX layer and pooling
> From version: 0.9.30
> Understanding: 90%
> Confidence: 86%
> Progress: 100%
> Complexity: Medium
> Theme: Visuals / Performance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Attack VFX need a dedicated render layer and pooling to stay performant and avoid per-frame allocations.

# Scope
- In:
- Add a VFX container/layer to the Pixi runtime (above units, below floating text).
- Add a small pool of VFX nodes (e.g. `PIXI.Graphics`) and lifecycle rules:
  - acquire, draw, fade, release.
- Add constants for duration/caps/colors/sizes.
- Out:
- No shader pipeline.
- No particle systems.

# Acceptance criteria
- The Pixi runtime exposes a dedicated VFX layer.
- A pool exists to reuse nodes and cap concurrent VFX.
- No leaks: VFX nodes are released and can be reused.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_046_dungeon_attack_vfx_arc_projectile_spell_beam.md`.
