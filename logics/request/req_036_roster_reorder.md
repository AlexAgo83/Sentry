## req_036_roster_reorder - Enable roster drag reordering (desktop + mobile)
> From version: 0.9.12
> Understanding: 94%
> Confidence: 92%

# Needs
- Reorder roster entries by drag-and-drop on desktop (click-and-hold, then drag).
- Reorder roster entries on mobile via long-press to activate drag, then drag.
- Persist roster order so it survives reloads and is used wherever roster is listed.

# Context
- Roster currently renders players sorted by numeric id (`selectPlayersSortedFromPlayers`).
- Roster cards are also used for quick hero selection; the drag UX must not block normal selection taps.

# Goals
- Let players customize roster order for readability and quick access.
- Make drag UX clear and reliable on both input modes.
- Avoid accidental reorders on normal tap/click.

# Locked decisions (v1)
- Desktop: drag starts on click-and-hold (no separate handle unless needed for conflicts).
- Mobile: long-press required before the list becomes draggable.
- The reorder applies to roster list order and should be persisted in save data.
- New heroes append to the end of the current order.
- If order data is missing or invalid, fall back to id-sorted order.
- Drag threshold: 8px (desktop + mobile).
- Mobile long-press delay: 500ms.
- Drag is allowed on the card body, but not on nested interactive controls (buttons/menus).
- Desktop: click-and-hold without drag selects the hero; drag cancels selection.
- Mobile: long-press without drag does not select (no-op).
- Normalization: remove unknown ids, dedupe, then append missing ids in ascending id order.
- Persistence: no migration required; normalization handles missing data.

# Scope detail (draft)
- Data:
  - Add `rosterOrder: PlayerId[]` to state and persistence.
  - Normalization: remove unknown ids, append missing ids in id order.
- Logic:
  - New action to move a hero in the roster order.
  - Update selectors to use `rosterOrder` instead of numeric id sort.
- UI:
  - Roster list becomes draggable with a visual lift/placeholder during drag.
  - Desktop: click-and-hold initiates drag; short click still selects the hero.
  - Mobile: long-press required to enter drag mode; tap still selects the hero.
  - Prevent drag on non-hero cards (add hero button) and header controls.

# Technical references to update
- `src/core/types.ts` (state shape for roster order)
- `src/core/state.ts` (initialize + normalize roster order)
- `src/core/reducer.ts` (reorder action)
- `src/app/selectors/gameSelectors.ts` (use roster order)
- `src/app/components/RosterPanel.tsx` (drag UI + interactions)
- `src/app/containers/RosterContainer.tsx` (wire callbacks)
- `src/app/styles/*` (drag styles)

# Acceptance criteria
- Desktop: user can click-and-hold a roster card and drag to reorder.
- Mobile: long-press required before dragging; normal tap still selects a hero.
- Reordered list persists after reload.
- New heroes appear at the end of the current order.
- The roster order is reflected anywhere roster lists are displayed.

# Risks / open points
- Exact long-press delay and drag threshold.
- Whether to require a drag handle vs whole-card drag.

# Backlog
- To be defined.
