## task_045_dungeon_persistence_offline_catch_up_and_replay - Dungeon persistence offline catch-up and replay
> From version: 0.8.22
> Understanding: 93%
> Confidence: 88%
> Progress: 0%

# Context
Derived from:
- `logics/backlog/item_059_dungeon_persistence_offline_catch_up_and_latest_run_replay.md`

This task ensures dungeon state integrity across local/cloud persistence, offline catch-up, and deterministic latest-run replay constraints.

# Plan
- [ ] 1. Extend save model with dungeon runtime state and latest-run replay snapshot fields.
- [ ] 2. Implement offline catch-up using existing cap and simulation rules; enforce stop on wipe/end conditions.
- [ ] 3. Persist latest replay only with cap guardrails (5000 events or 2 MB serialized) and critical-event fallback.
- [ ] 4. Integrate cloud conflict behavior: default to newest save, show explicit active-run warning in conflict UI.
- [ ] 5. Route to dungeon live screen by default when an active run remains after resume/catch-up.
- [ ] 6. Add tests for save round-trip, offline parity, replay deterministic load, and payload cap behavior.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
