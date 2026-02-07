## item_090_action_journal_ui - Display the last 10 actions
> From version: 0.9.10
> Understanding: 94%
> Confidence: 92%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Players need a readable UI surface for the last 10 actions.

# Scope
- In:
- Add a compact journal list in the System/Settings area.
- Display time + short description per entry.
- Keep layout minimal and readable.
- Out:
- No advanced filtering or search.

# Decisions
- Location: System/Settings area (debug-friendly, non-intrusive).
- Use a simple list style consistent with other info lists.
- Keep entries to a single line when possible.
- Display relative time.
- Show newest entries first.

# Acceptance criteria
- The UI shows the most recent 10 entries.
- The list updates as new actions occur.
- The list is readable on mobile and desktop.

# Priority
- Impact: Medium
- Urgency: Low

# Notes
- Derived from `logics/request/req_030_recent_action_journal.md`.
