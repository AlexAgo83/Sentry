## task_045_dungeon_persistence_offline_catch_up_and_replay - Dungeon persistence offline catch-up and replay
> From version: 0.8.22
> Understanding: 93%
> Confidence: 88%
> Progress: 100%

# Context
Derived from:
- `logics/backlog/item_059_dungeon_persistence_offline_catch_up_and_latest_run_replay.md`

This task ensures dungeon state integrity across local/cloud persistence, offline catch-up, and deterministic latest-run replay constraints.

# Plan
- [x] 1. Extend save model with dungeon runtime state and latest-run replay snapshot fields.
- [x] 2. Implement offline catch-up using existing cap and simulation rules; enforce stop on wipe/end conditions.
- [x] 3. Persist latest replay only with cap guardrails (5000 events or 2 MB serialized) and critical-event fallback.
- [x] 4. Integrate cloud conflict behavior: default to newest save, show explicit active-run warning in conflict UI.
- [x] 5. Route to dungeon live screen by default when an active run remains after resume/catch-up.
- [x] 6. Add tests for save round-trip, offline parity, replay deterministic load, and payload cap behavior.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Completed in code: save model/migrations/serialization for dungeon, offline catch-up integration, replay caps/fallback, auto-open live dungeon screen on resume, and explicit active-run warning in cloud conflict UI with newest-save guidance.
- Added/updated tests for dungeon save round-trip serialization, offline deterministic parity (split vs bulk tick), replay cap fallback behavior, and cloud conflict warning rendering.
