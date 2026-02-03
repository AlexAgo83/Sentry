## item_057_dungeon_v1_data_pack_and_boss_mechanics - Dungeon v1 data pack and boss mechanics
> From version: 0.8.22
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Problem
The simulation requires a stable, data-driven dungeon content pack for v1 (5 dungeons, floor parameters, boss signatures, and scaling values).

# Scope
- In:
  - Add initial 5-dungeon pack and order: Ruines humides, Cryptes d'os, Forges brisees, Sanctuaire noir, Citadelle rouge.
  - Keep floor count configurable per dungeon with v1 default of 10.
  - Define and expose a recommended power value per dungeon.
  - Add one final boss per dungeon and one signature mechanic per boss.
  - Encode scaling formulas and tuning defaults in data files (not hardcoded in UI).
- Out:
  - Procedural dungeon generation and runtime mutators.
  - Multi-boss encounters and advanced affix systems.

# Acceptance criteria
- All 5 v1 dungeons are selectable and use data-defined parameters.
- Each dungeon exposes a recommended power value in data and UI binding points.
- Each dungeon reaches a final boss encounter and applies its signature behavior.
- Floor count and scaling settings can be changed from data without engine refactor.
- Data definitions validate and load without runtime schema errors.

# Priority
- Impact: High (playable content for feature launch).
- Urgency: High (needed for testable dungeon runs).

# Notes
- Source request: `logics/request/req_018_group_idle_dungeon_combat_loop.md`
- Derived from `logics/request/req_018_group_idle_dungeon_combat_loop.md`.
