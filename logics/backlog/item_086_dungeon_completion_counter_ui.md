## item_086_dungeon_completion_counter_ui - Show completion badges in dungeon UI
> From version: 0.9.9
> Understanding: 90%
> Confidence: 84%
> Progress: 10%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Players need to see completion counts in dungeon selection and in the dungeon render view.

# Scope
- In:
- Add an `xN` badge in dungeon selection cells.
- Add a small `xN` badge in run and replay views.
- Hide badges when count is 0.
- Out:
- No new screen or redesign.

# Decisions
- Badge format: `xN`, same visual style as dungeon pills.
- Show in selection list and in run/replay meta area.
- Selection list: right-aligned badge within the dungeon cell.
- Run/replay: badge placed near the dungeon meta row (next to Dungeon name).

# Acceptance criteria
- Selection list and run/replay views display the badge when count > 0.
- No badge shown when count is 0.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_028_dungeon_completion_counter.md`.
