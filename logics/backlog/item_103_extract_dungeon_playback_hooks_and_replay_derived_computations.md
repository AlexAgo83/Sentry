## item_103_extract_dungeon_playback_hooks_and_replay_derived_computations - Extract dungeon playback hooks and replay-derived computations
> From version: 0.9.24
> Understanding: 94%
> Confidence: 91%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Playback cursors, RAF loops, and replay-derived metrics are deeply coupled inside `DungeonScreen`. This makes timing logic hard to validate and replay analytics difficult to evolve.

# Scope
- In:
- Extract dedicated hooks from `src/app/components/DungeonScreen.tsx`:
  - `useDungeonLivePlayback`
  - `useDungeonReplayPlayback`
  - `useDungeonReplayDerived`
- Extract shared pure helpers for damage/threat/cooldown/replay marker computations.
- Keep behavior parity for pause, speed, cursor reset, and end-of-replay pause.
- Out:
- No new replay features.
- No schema changes in dungeon state.

# Acceptance criteria
- RAF/playback logic is no longer embedded directly in the main screen component.
- Replay derived data is computed from focused hooks/helpers.
- Existing replay controls and timeline interactions behave exactly as before.
- Focused tests cover extracted playback and derived computations.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_037_split_dungeon_screen_and_arena_modules_for_maintainability.md`.
- Main references: `src/app/components/DungeonScreen.tsx`, `src/core/dungeon.ts`.
