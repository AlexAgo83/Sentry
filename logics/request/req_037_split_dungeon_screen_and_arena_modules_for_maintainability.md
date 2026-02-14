## req_037_split_dungeon_screen_and_arena_modules_for_maintainability - Split dungeon screen and arena modules for maintainability
> From version: 0.9.24
> Understanding: 95%
> Confidence: 92%
> Complexity: High
> Theme: Architecture
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Split oversized dungeon UI/renderer files into smaller, focused modules.
- Keep gameplay behavior and replay outputs unchanged while improving maintainability.
- Reduce regression risk by separating orchestration logic, derived computations, and presentation layers.

# Context
- Current hotspots are very large and combine multiple responsibilities:
  - `src/app/components/DungeonScreen.tsx` (~1148 lines)
  - `src/app/components/dungeon/DungeonArenaRenderer.tsx` (~734 lines)
  - `src/app/components/dungeon/arenaPlayback.ts` (~555 lines)
- `DungeonScreen` currently contains setup UI, live UI, replay UI, replay/log analytics, and playback loops in one component.
- `DungeonArenaRenderer` currently combines Pixi bootstrapping/runtime lifecycle, arena drawing, unit drawing, and frame update orchestration in one file.

# Goals
- Establish clear boundaries between domain calculations, playback control, and visual rendering.
- Improve readability and reviewability for future dungeon features (telemetry, graphics settings, replay UX).
- Enable incremental testing by extracting pure functions/hooks from large components.
- Make test coverage a first-class requirement so structural refactors remain safe.

# Locked decisions (v1)
- No gameplay/balance changes in this request.
- No visual redesign in this request (only structural refactor with behavior parity).
- Split should be incremental and merge-safe (feature freeze on each extracted unit before next step).
- Testing is mandatory for each extraction step; no split is considered complete without validation.

# Scope detail (draft)
- `DungeonScreen` split:
  - Extract hooks:
    - `useDungeonLivePlayback` (live cursor RAF + overrun behavior)
    - `useDungeonReplayPlayback` (replay pause/speed/cursor RAF)
    - `useDungeonReplayDerived` (marks, damage totals, threat totals, cooldowns, log metadata)
  - Extract components:
    - `DungeonHeaderActions`
    - `DungeonSetupView`
    - `DungeonLiveView`
    - `DungeonReplayView`
    - Shared entity cards for hero/enemy summary blocks where duplication exists.
- `DungeonArenaRenderer` split:
  - Move Pixi runtime bootstrap/teardown into a dedicated hook/module.
  - Move drawing primitives into focused modules (`drawArena`, `drawUnits`, `drawFloatingTexts`).
  - Keep a thin renderer component focused on wiring props to runtime update.
- `arenaPlayback` split:
  - Extract pure helpers (layout, floating texts, event windowing, jump marks).
  - Keep frame builder as dedicated module; keep public API stable for live/replay frame consumers.

# Technical references to update
- `src/app/components/DungeonScreen.tsx`
- `src/app/containers/DungeonScreenContainer.tsx`
- `src/app/components/dungeon/DungeonArenaRenderer.tsx`
- `src/app/components/dungeon/arenaPlayback.ts`
- `src/app/components/dungeon/*` (new extracted modules)
- `src/app/styles/panels/dungeon.css` (only if class ownership changes)

# Acceptance criteria
- Dungeon setup/live/replay behavior is unchanged from player perspective.
- Replay timeline markers, play/pause, speed, and log navigation remain functional.
- Live and replay arena rendering outputs remain behaviorally equivalent.
- Extracted modules are smaller and responsibility-focused; large-file hotspots are reduced.
- Existing dungeon tests pass, and at least smoke coverage remains for setup/live/replay rendering flows.
- New or updated tests cover extracted logic (hooks/helpers) and critical UI paths (setup/live/replay).

# Test expectations
- Run at minimum:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run tests`
- Add focused tests when extracting:
  - Pure function tests for replay-derived calculations and playback helpers.
  - Component/integration tests for replay controls, timeline interactions, and live/replay render switching.
  - Non-regression checks for RAF-driven playback behavior.

# Risks / open points
- Tight coupling between replay-derived memos and UI may cause accidental prop churn.
- RAF/playback extraction can alter timing if not carefully preserved.
- Renderer split can introduce subtle visual regressions in floating text or damage animation.

# Backlog
- `logics/backlog/item_102_split_dungeonscreen_into_setup_live_replay_and_header_modules.md`
- `logics/backlog/item_103_extract_dungeon_playback_hooks_and_replay_derived_computations.md`
- `logics/backlog/item_104_modularize_dungeonarenarenderer_pixi_runtime_and_drawing_pipeline.md`
- `logics/backlog/item_105_split_arena_playback_frame_builder_into_focused_modules.md`
- `logics/backlog/item_106_add_dungeon_refactor_regression_and_non_regression_test_coverage.md`
