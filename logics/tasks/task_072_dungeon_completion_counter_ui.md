## task_072_dungeon_completion_counter_ui - Show completion badges
> From version: 0.9.9
> Owner: —
> Status: Ready
> Understanding: 84%
> Confidence: 76%
> Progress: 0%

# Summary
Display `xN` completion badges in the dungeon selection list and run/replay views.

# Dependencies
- item_086_dungeon_completion_counter_ui
- task_071_dungeon_completion_counter_state

# Steps
1. Add `xN` badge in dungeon selection cell UI.
2. Add `xN` badge near dungeon meta row in run/replay view.
3. Hide badge when count is 0.
4. Style using existing dungeon pill styles.

# Acceptance criteria
- Selection list shows badge for dungeons with count > 0.
- Run/replay view shows badge for the active dungeon when count > 0.
