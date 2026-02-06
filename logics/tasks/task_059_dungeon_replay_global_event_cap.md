## task_059_dungeon_replay_global_event_cap - Dungeon replay global event cap
> From version: 0.9.8
> Understanding: 95%
> Confidence: 94%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_073_dungeon_replay_event_cap.md`

# Decisions
- `DUNGEON_TOTAL_EVENT_CAP = 10000`.
- Cap applies only to non-critical events.
- Switch to critical-only logging immediately when cap is reached.
- Reuse `truncatedEvents` for dropped non-critical events.

# Plan
- [x] 1. Add global non-critical event cap (`DUNGEON_TOTAL_EVENT_CAP`) and cap-aware event push in `src/core/dungeon.ts`.
- [x] 2. Ensure critical events always log and `truncatedEvents` increments for dropped non-critical events.
- [x] 3. Add/adjust tests for cap behavior and determinism.
- [x] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
- Added a global non-critical event cap with critical-only fallback and coverage for cap behavior.
