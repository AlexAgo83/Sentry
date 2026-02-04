## req_019_dungeon_combat_xp_and_roaming_skill_split - Dungeon Combat XP + Roaming skill split
> From version: 0.9.2
> Understanding: 98%
> Confidence: 93%

# Needs
- Heroes must gain **Combat** XP during dungeon runs.
- The `Combat` skill must become a real dungeon gameplay skill (not an implicit roaming alias anymore).
- Any remaining references where roaming uses `Combat` must be migrated to `Roaming`.
- Add proper skill assets for `Combat` (same quality/consistency level as other skills), instead of reusing roaming visuals.
- Apply a clean save reset for this split (preferred implementation path for v1).

# Goals
- Clarify the player mental model: `Roaming` = solo exploration activity, `Combat` = dungeon progression.
- Remove code/data model ambiguity caused by legacy `Combat` usage in roaming.
- Enable independent balance tuning for `Roaming` and `Combat` progression.

# Locked decisions (v1)
- `Combat` becomes the dungeon progression skill.
- `Roaming` becomes an explicit data/code skill (`Roaming` id) for roaming actions/recipes.
- Roaming screens and labels must no longer depend on `Combat`.
- `Combat` must not be selectable in the Action screen (dungeon-only progression skill).
- Save strategy (v1): clean save reset only (no legacy migration in this iteration).
- Dungeon Combat XP grant:
  - Grant at floor clear using `floorXp = 6 + (tier * 3) + floor`.
  - Grant boss bonus on last floor using `bossBonusXp = floorXp * 2`.
  - Apply grants to party members at milestone events (no per-hit XP writes).
  - Batched attribution (no save write on each hit) to reduce churn/perf overhead.

# Scope detail (draft)
- Data model / types:
  - Introduce `Roaming` in `SkillId`.
  - Keep `Combat` as a distinct skill.
- Skills/actions/recipes data:
  - `skills.ts`: define `Combat` and `Roaming` with dedicated parameters.
  - `actions.ts`: roaming loop must target `Roaming`.
  - Roaming-related `recipes/*`: `skillId` must move from `Combat` to `Roaming`.
- Dungeon runtime:
  - Add Combat XP grants during run using the v1 formula (floor clear + boss bonus).
  - Keep existing dungeon scaling based on `player.skills.Combat.level`.
- UI/UX:
  - Dungeon: show `Combat Lv` (unchanged label, now with real run progression).
  - Action/Roaming: remove any legacy `Combat` traces from roaming UX.
  - Action selection: never expose `Combat` as a selectable action.
  - Stats: visually separate `Roaming` and `Combat` in aggregated skill views.
  - Add dedicated skill visuals for `Combat` (`icon` + `background`) and keep `Roaming` visuals explicit/consistent.
- Save/persistence:
  - If reset is enabled: document reset and bump version/save envelope.
  - If migration is enabled: ensure consistency for `selectedActionId`, selected recipes, and skill progression.

# Technical references to update
- `src/core/types.ts`
- `src/data/definitions/skills.ts`
- `src/data/definitions/actions.ts`
- `src/data/definitions/recipes/index.ts`
- `src/data/definitions/recipes/combat.ts` (rename/redistribute to roaming)
- `src/core/loop.ts`
- `src/core/dungeon.ts`
- `src/app/ui/skillBackgrounds.ts`
- `src/app/ui/skillColors.ts`
- `public/img/icons/skills/Combat.svg`
- `public/img/icons/skills/Roaming.svg`
- `public/img/backgrounds/combat.svg`
- Action/Dungeon/Stats UI components still showing `Combat` for roaming

# Tests & QA
- Unit:
  - Roaming no longer increments `Combat`; it increments `Roaming`.
  - Dungeon increments `Combat` according to gain rules.
  - No regression on dungeon scaling (still based on `Combat`).
- Integration:
  - New dungeon run => visible `Combat` progression.
  - Roaming action selection/recipes work with `Roaming`.
  - Action screen does not list `Combat` as a selectable action.
- Regression:
  - No remaining roaming UI reference to `Combat`.
  - Offline dungeon catch-up correctly applies `Combat` gains.
- Save:
  - Reset path validated.

# Risks / open points
- Combat XP tuning (progression speed, impact on dungeon difficulty).
- Impact on overall balance (skills, stats, rewards) after progression split.
- Save reset communication to players (timing and messaging).

# Backlog
- `logics/backlog/item_062_split_roaming_skill_from_combat_in_data_and_ui.md`
- `logics/backlog/item_063_add_dungeon_combat_xp_progression_pipeline.md`
- `logics/backlog/item_064_migrate_or_reset_save_for_skill_id_split.md`
- `logics/backlog/item_065_update_tests_for_roaming_combat_skill_separation.md`
