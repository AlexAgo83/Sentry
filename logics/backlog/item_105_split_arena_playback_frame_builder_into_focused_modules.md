## item_105_split_arena_playback_frame_builder_into_focused_modules - Split arena playback frame builder into focused modules
> From version: 0.9.24
> Understanding: 93%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`arenaPlayback.ts` aggregates type definitions, layout helpers, replay event processing, floating text logic, and frame building in one file, limiting readability and test isolation.

# Scope
- In:
- Split `src/app/components/dungeon/arenaPlayback.ts` into dedicated modules (types/helpers/frame builder/public facade).
- Keep `buildDungeonArenaLiveFrame`, `buildDungeonArenaReplayFrame`, and jump mark API stable for existing callers.
- Move pure utilities to files that can be unit-tested directly.
- Out:
- No changes in combat event semantics.
- No behavior changes in resulting frame payload.

# Acceptance criteria
- `arenaPlayback` responsibilities are separated into smaller files.
- Public APIs consumed by `DungeonScreen` and renderer remain stable.
- Existing frame outputs for representative scenarios remain equivalent.
- Targeted unit tests cover extracted pure helpers/frame-building behavior.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_037_split_dungeon_screen_and_arena_modules_for_maintainability.md`.
- Main references: `src/app/components/dungeon/arenaPlayback.ts`, `src/app/components/DungeonScreen.tsx`.
- Implemented via `logics/tasks/task_088_execute_dungeon_maintainability_split_across_backlog_items_102_to_106.md`.
