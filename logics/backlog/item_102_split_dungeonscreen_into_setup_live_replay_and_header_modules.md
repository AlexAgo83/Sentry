## item_102_split_dungeonscreen_into_setup_live_replay_and_header_modules - Split DungeonScreen into setup, live, replay, and header modules
> From version: 0.9.24
> Understanding: 93%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`DungeonScreen` currently centralizes setup UI, live run UI, replay UI, header actions, and many view-specific mappings. The file is too large to review safely and increases regression risk for any dungeon UI change.

# Scope
- In:
- Extract presentational sub-components from `src/app/components/DungeonScreen.tsx`:
  - `DungeonHeaderActions`
  - `DungeonSetupView`
  - `DungeonLiveView`
  - `DungeonReplayView`
- Keep the parent component as orchestrator/composition layer.
- Preserve current props contract with `DungeonScreenContainer`.
- Out:
- No gameplay changes.
- No replay algorithm changes.
- No visual redesign.

# Acceptance criteria
- `DungeonScreen.tsx` no longer contains all setup/live/replay markup inline.
- Setup/live/replay and header behavior stay identical from player perspective.
- Build/lint/tests pass after extraction.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_037_split_dungeon_screen_and_arena_modules_for_maintainability.md`.
- Main references: `src/app/components/DungeonScreen.tsx`, `src/app/containers/DungeonScreenContainer.tsx`.
- Implemented via `logics/tasks/task_088_execute_dungeon_maintainability_split_across_backlog_items_102_to_106.md`.
