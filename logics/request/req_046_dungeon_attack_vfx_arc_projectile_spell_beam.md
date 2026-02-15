## req_046_dungeon_attack_vfx_arc_projectile_spell_beam - Add lightweight attack VFX in the dungeon renderer
> From version: 0.9.30
> Understanding: 92%
> Confidence: 88%
> Complexity: Medium
> Theme: UX / Visuals
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add a visual effect for each attack in the dungeon arena renderer:
  - Melee: a short, glowing circular arc in front of the attacker, facing the target direction.
  - Ranged: replace arc with a projectile that quickly travels from attacker to target.
  - Spell (magic): replace arc with a translucent glowing beam/line that appears briefly and fades out.

# Context
- The dungeon arena currently shows:
  - unit silhouettes / bodies,
  - HP bars,
  - damage/heal floating text,
  - attack lunge (units briefly move toward target),
  - magic pulse (currently used for some heal cues).
- Combat is fast and can feel visually “flat” without a clear “hit” cue.
- We already have `attackCues` in `DungeonArenaFrame` that include `sourceId`, `targetId`, `atMs`.

# Goals
- Make attacks visually readable (who attacked whom) without cluttering the screen.
- Keep VFX cheap: minimal allocations, short duration, pooled nodes, and safe fallback in low-perf environments.
- Work for both live dungeon and replay (same renderer).

# Non-goals
- Particle systems, advanced shader/glow pipelines, and complex hit-sparks (v1 keeps it simple).
- Full animation overhaul for unit bodies.
- Perfect synchronization with every damage number (we use the existing cue timing).

# Locked decisions (v1)
- VFX are rendered in Pixi (`PIXI.Graphics` or simple sprites), time-based off `frame.atMs`.
- Effect selection is derived from attacker `weaponType` when available:
  - `"Melee"` => arc
  - `"Ranged"` => projectile
  - `"Magic"` => beam
  - missing/unknown => arc (fallback)
- Lunge behavior:
  - Lunge should only apply to melee attackers.
  - Ranged/magic should not lunge (their VFX will communicate the action instead).

# Scope detail (draft)
- Data / cues
  - Reuse `DungeonArenaFrame.attackCues` (already has `sourceId`, `targetId`, `atMs`).
  - No core replay event format changes required for v1.
  - If later we need enemy-specific weapon types or spell variants, we can extend cues, but v1 sticks to existing fields.

- Renderer changes
  - Add a dedicated VFX layer/container to the Pixi runtime (above units, below floating text).
  - Maintain a small pool of VFX nodes (graphics objects) to avoid per-frame allocations.
  - For each visible cue within a small window:
    - compute attacker and target world positions,
    - compute direction vector,
    - draw the appropriate effect with alpha fade (and optional scale pulse).

- Melee arc effect
  - A partial circle/arc (e.g. 90-140 degrees) positioned a bit in front of attacker along direction vector.
  - Glowing look via:
    - thicker stroke,
    - soft alpha falloff,
    - optional “double stroke” (outer stroke low alpha + inner stroke higher alpha).

- Ranged projectile effect
  - A small glowing dot/bolt traveling from attacker to target over ~80-140ms.
  - Optional trail line with decreasing alpha.

- Magic beam effect
  - A thin translucent line from attacker to target with a short glow pulse.
  - Appears quickly then fades out (~120-200ms).

- Performance constraints
  - Cap the number of simultaneous effects (e.g. 8-12) to avoid worst-case spam.
  - Ensure “no frame” or missing target/source does not throw (just skip).

# UX notes
- The effect should be visually “in front” of the attacker:
  - positioned toward the target direction,
  - drawn above the attacker body.
- Color palette suggestion (adjustable):
  - melee arc: warm gold
  - ranged projectile: mint/teal
  - magic beam: pale violet/blue

# Technical references to update
- `src/app/components/dungeon/arenaPlayback/types.ts` (only if we decide to extend cues; v1 tries not to)
- `src/app/components/dungeon/renderer/types.ts` (Pixi runtime additions: vfx container + pools)
- `src/app/components/dungeon/renderer/runtime.ts` (create vfx container/layer)
- `src/app/components/dungeon/renderer/updateFrame.ts` (apply VFX + melee-only lunge)
- `src/app/components/dungeon/renderer/constants.ts` (durations, sizes, caps, colors)

# Acceptance criteria
- Melee attackers show an arc glow “slash” cue toward the target and still lunge.
- Ranged attackers show a projectile traveling to the target and do not lunge.
- Magic attackers show a brief glowing beam/line to the target and do not lunge.
- Effects fade out cleanly and never persist indefinitely.
- No renderer crashes when target/source is missing or dies quickly.
- The arena remains performant and readable (no excessive flashing or clutter).

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions (unit-level)
  - Add tests for effect selection logic (weaponType -> effect kind).
  - Add tests (with a mocked Pixi runtime) that ensure `updateFrame`:
    - does not apply lunge for `weaponType: "Ranged" | "Magic"`
    - does apply lunge for `weaponType: "Melee"`
    - does not throw when cues reference missing units

# Risks / open points
- Enemies currently may not have `weaponType`, so they may use fallback arc in v1.
- Visual intensity can be too strong depending on screen scaling; keep constants tweakable.
- Pooling/cleanup must be correct to avoid memory leaks in long sessions.

# Backlog
- `logics/backlog/item_148_add_pixi_attack_vfx_layer_and_pooling.md`
- `logics/backlog/item_149_add_melee_arc_vfx_and_limit_lunge_to_melee.md`
- `logics/backlog/item_150_add_ranged_projectile_and_magic_beam_vfx.md`
- `logics/backlog/item_151_add_attack_vfx_regression_tests_and_full_validation.md`
