## task_059_dungeon_replay_global_event_cap - Dungeon replay global event cap
> From version: 0.9.8
> Understanding: 90%
> Confidence: 88%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_073_dungeon_replay_event_cap.md`

# Plan
- [ ] 1. Add global non-critical event cap (`DUNGEON_TOTAL_EVENT_CAP`) and cap-aware event push in `src/core/dungeon.ts`.
- [ ] 2. Ensure critical events always log and `truncatedEvents` increments for dropped non-critical events.
- [ ] 3. Add/adjust tests for cap behavior and determinism.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
