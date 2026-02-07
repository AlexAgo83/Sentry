## item_089_action_journal_state - Capture last 10 actions in state
> From version: 0.9.10
> Understanding: 94%
> Confidence: 92%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
We need a lightweight action journal to improve readability and debugging.

# Scope
- In:
- Add a rolling buffer of the last 10 action events.
- Record events like action start/change, dungeon start/end, offline recap.
- Session-only storage in v1.
- Out:
- No deep analytics or long-term history.

# Decisions
- Session-only (no persistence) in v1.
- Keep exactly 10 entries (rolling window).
- Events included: action start/change, dungeon start/end, offline recap summary.
- Entries are short text + relative time (rounded to minutes).
- Failures to record must not affect gameplay.

# Acceptance criteria
- The journal records and stores the last 10 events.
- Events are updated in real time and after offline catch-up.
- No noticeable performance impact.

# Priority
- Impact: Medium
- Urgency: Low

# Notes
- Derived from `logics/request/req_030_recent_action_journal.md`.
