## item_108_extract_dungeon_replay_and_event_capping_pipeline - Extract dungeon replay and event capping pipeline
> From version: 0.9.24
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Replay payload construction, critical-event fallback, and event capping are embedded in `src/core/dungeon.ts`, increasing coupling and making replay regressions harder to isolate.

# Scope
- In:
- Extract replay-specific logic into `src/core/dungeon/replay.ts`:
  - replay build function
  - event append/capping helpers
  - critical-event filtering and non-critical counting
- Keep replay output schema unchanged.
- Ensure byte cap and event cap behavior remain equivalent.
- Out:
- No replay viewer UI changes.
- No changes to replay persistence schema.

# Acceptance criteria
- Replay pipeline logic is no longer inline in `src/core/dungeon.ts`.
- Replay output remains backward-compatible.
- Existing replay tests continue to pass.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_038_split_core_dungeon_module_into_domain_focused_files.md`.
- Key references: `src/core/dungeon.ts`, `tests/core/dungeonReplay.test.ts`.
