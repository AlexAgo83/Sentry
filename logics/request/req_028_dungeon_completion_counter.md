## req_028_dungeon_completion_counter - Track and display dungeon completion count
> From version: 0.9.9
> Understanding: 92%
> Confidence: 86%

# Needs
- Track how many times each dungeon has been completed.
- Display the completion count in the dungeon selection cell.
- Display the completion count as a badge in the dungeon render view.

# Context
- Players want visibility on dungeon completion history.
- The count should persist across sessions.

# Goals
- Persist a per-dungeon completion counter.
- Surface the counter in dungeon selection and in-run UI.
- Keep UI compact and readable.

# Locked decisions (v1)
- Counter increments on victory only.
- Count is per dungeon ID.
- No reset/season handling for now.
- Display count in selection list and in-render badge.
- Hide the badge when the count is 0.
- Badge format: `xN` with a compact pill (same style as dungeon pills).
- Show the badge in run and replay views.

# Scope detail (draft)
- Data:
  - Add a per-dungeon completion counter to persisted state.
  - Increment on `run_end` with victory status.
- UI:
  - Dungeon selection cell shows a compact `xN` badge on the right side.
  - Dungeon render view shows a small `xN` badge near the dungeon meta (and in replay).

# Technical references to update
- `src/core/types.ts`
- `src/core/dungeon.ts`
- `src/core/runtime.ts` (or wherever run completion is finalized)
- `src/app/components/DungeonScreen.tsx`
- `src/app/components/dungeon/DungeonArenaRenderer.tsx`
- `src/app/styles/panels/dungeon.css`
- `src/adapters/persistence/saveMigrations.ts` (if new state field)

# Acceptance criteria
- Each dungeon completion increments its counter once.
- The counter persists across reloads.
- Both the selection list and render view display the counter.
 - Badge is hidden when count is 0.

# Risks / open points
- None for v1.

# Backlog
- To be split after approval.
