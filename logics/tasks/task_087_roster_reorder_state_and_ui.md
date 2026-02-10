## task_087_roster_reorder_state_and_ui - Implement roster order persistence + drag reorder UI
> From version: 0.9.12
> Understanding: 94%
> Confidence: 92%
> Status: Done
> Progress: 100%
> Reminder: Update Understanding/Confidence/Status when you edit this doc.

# Goal
Enable roster reordering with drag-and-drop on desktop and mobile, and persist the custom order across reloads.

# Requirements
- Persist `rosterOrder: PlayerId[]` in state + save data.
- Normalize order (filter unknown, dedupe, append missing ids by ascending id).
- New action to reorder heroes in roster.
- Update roster selectors to use the persisted order everywhere the roster list is shown.
- Desktop: click-and-hold drag; click-and-hold without drag selects hero.
- Mobile: long-press (500ms) to arm drag; drag threshold 8px; long-press without drag is no-op.
- Prevent drag from nested interactive controls (buttons/menus).
- Drag UI shows lift/placeholder feedback.

# Suggested decisions
- Append new heroes to the end of `rosterOrder`.
- No migration step; normalization handles missing data.
- Whole card is draggable except opt-out zones.

# Plan
1. Add `rosterOrder` to core state + persistence, with normalization helper.
2. Add reorder action in reducer and update selectors to use roster order.
3. Update roster UI to support drag on desktop/mobile with the agreed thresholds.
4. Prevent drag on interactive child controls and the add-hero card.
5. Add/adjust tests for order persistence and drag UX behavior.
6. Update backlog items progress on completion.

# Implementation notes
- Likely files: `src/core/types.ts`, `src/core/state.ts`, `src/core/reducer.ts`, `src/app/selectors/gameSelectors.ts`,
  `src/app/components/RosterPanel.tsx`, `src/app/containers/RosterContainer.tsx`, `src/app/styles/*`.
- Prefer a single selector for roster ordering to avoid drift across views.

# Acceptance checks
- Roster order persists after reload.
- New heroes append to end of current order.
- Desktop click-and-hold drag reorders; click without drag still selects.
- Mobile long-press required; normal tap still selects.
- Drag does not start from interactive controls or add-hero card.
- All roster lists display the same order.

# Dependencies
- item_100_roster_order_state_and_selectors
- item_101_roster_drag_reorder_ui

# Follow-ups
- Update backlog item progress and references.
