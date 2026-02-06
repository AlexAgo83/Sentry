## item_073_dungeon_replay_event_cap - Dungeon replay global event cap
> From version: 0.9.8
> Understanding: 93%
> Confidence: 92%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Long offline catch-up sessions can generate very large replay event arrays, increasing memory use and save payload size.

# Scope
- In:
- Add `DUNGEON_TOTAL_EVENT_CAP = 10000` for non-critical events.
- Switch to critical-only logging once the cap is reached.
- Track dropped non-critical events via `truncatedEvents` (or a dedicated counter).
- Out:
- No changes to combat outcomes.

# Decisions
- Cap applies only to non-critical events.
- Switch to critical-only logging immediately when cap is reached.
- Reuse `truncatedEvents` to count dropped non-critical events.

# Acceptance criteria
- Non-critical `run.events` never exceed `DUNGEON_TOTAL_EVENT_CAP`.
- Critical events (`floor_start`, `boss_start`, `heal`, `death`, `run_end`) still log after cap.
- Replay determinism holds with the same seed/state.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_022_dungeon_gameplay_logic_optimizations.md`.
