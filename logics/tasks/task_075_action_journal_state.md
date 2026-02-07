## task_075_action_journal_state - Capture last 10 actions
> From version: 0.9.10
> Owner: —
> Status: Planned
> Understanding: 94%
> Confidence: 92%
> Progress: 0%

# Summary
Add a session-only rolling journal of the last 10 action events.

# Dependencies
- item_089_action_journal_state

# Steps
1. Add a ring buffer (max 10) to runtime/UI state (session-only).
2. Record events: action start/change, dungeon start/end, offline recap summary.
3. Store a short label and a timestamp for relative time rendering.
4. Ensure journal updates do not block gameplay.
5. Add a small unit test for rolling behavior.

# Decisions
- Session-only (no persistence).
- Keep exactly 10 entries (newest first).
- Relative time rounded to minutes.

# Acceptance criteria
- Journal captures and keeps only the last 10 events.
- New events append without performance impact.
- Entries include label + timestamp.
