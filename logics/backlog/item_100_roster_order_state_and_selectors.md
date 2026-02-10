## item_100_roster_order_state_and_selectors - Persist roster order and selectors
> From version: 0.9.12
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Roster order is currently derived from numeric id sorting and cannot be customized or persisted.

# Scope
- In:
- Add `rosterOrder: PlayerId[]` to core state and persistence.
- Normalize roster order (filter unknowns, dedupe, append missing ids by ascending id).
- New reorder action to move a hero within the roster order.
- Update selectors to use roster order everywhere the roster list is displayed.
- Ensure new heroes append to the end of the current order.
- Out:
- No changes to hero creation flow beyond appending to `rosterOrder`.
- No cross-device sync changes beyond normal save persistence.

# Decisions
- Missing/invalid `rosterOrder` falls back to id-sorted order via normalization.
- Append missing ids in ascending id order after filtering/duping.
- Reorder action is the single source of truth for list order changes.
- No migration step needed; normalization handles older saves.

# Acceptance criteria
- Roster order persists after reload.
- New heroes appear at the end of the current roster order.
- All roster lists reflect `rosterOrder` consistently.
- Invalid roster orders self-heal to a valid order.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_036_roster_reorder.md`.
