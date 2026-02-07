## item_085_dungeon_completion_counter_state - Track completions per dungeon ID
> From version: 0.9.9
> Understanding: 95%
> Confidence: 91%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
We need to persist how many times each dungeon is completed (victory only).

# Scope
- In:
- Add per-dungeon completion counter to persisted state.
- Increment on victory run end.
- Handle save migration for the new field.
- Out:
- No season/refresh reset.

# Decisions
- Counter increments on victory only.
- Count is keyed by dungeon ID.
- Replay views do not increment the counter.
- Counter is global (shared across heroes).

# Acceptance criteria
- Counter increments exactly once per victorious run.
- Counters persist across reloads and migrations.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_028_dungeon_completion_counter.md`.
