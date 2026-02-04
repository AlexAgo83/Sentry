## item_062_split_roaming_skill_from_combat_in_data_and_ui - Split roaming skill from combat in data and UI
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Problem
Roaming still depends on the legacy `Combat` skill wiring, which creates player confusion (wrong mental model), data ambiguity, and UI inconsistency across Action/Dungeon/Stats screens.

# Scope
- In:
  - Introduce explicit `Roaming` skill usage for roaming gameplay loops.
  - Update skill/action/recipe mappings so roaming actions and recipes no longer reference `Combat`.
  - Keep `Combat` as dungeon-only progression and remove it from Action selection.
  - Update UI labels and selectors to separate `Roaming` (action flow) and `Combat` (dungeon flow).
  - Add dedicated skill assets for split visuals:
    - `public/img/icons/skills/Combat.svg`
    - `public/img/icons/skills/Roaming.svg`
    - `public/img/backgrounds/combat.svg`
- Out:
  - Combat XP gain logic details (handled by dedicated XP pipeline item).
  - Save reset/migration mechanics (handled by dedicated save item).

# Acceptance criteria
- Action screen never lists `Combat` as a selectable action.
- Roaming action/recipe references point to `Roaming` only.
- Dungeon screen continues to display/use `Combat Lv` for dungeon power context.
- Combat and Roaming visuals resolve to dedicated assets without fallback to legacy roaming reuse.

# Priority
- Impact: High (core model clarity + UI consistency).
- Urgency: High (prerequisite for clean split rollout).

# Notes
- Source request: `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`
- Derived from `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`.
