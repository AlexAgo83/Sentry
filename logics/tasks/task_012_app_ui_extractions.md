## task_012_app_ui_extractions - Execute backlog item 012
> From version: 0.7.2
> Understanding: 96%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_012_app_ui_extractions.md`.
This task executes `item_012_app_ui_extractions`.

# Plan
- [x] 1. Create `ModalShell` and extract Loadout/System/OfflineSummary modals into components.
- [x] 2. Replace Recruit/Rename with a shared `HeroNameModal` component (keep behavior identical).
- [x] 3. Extract hooks for inventory view, pending action selection, and action status derived data.
- [x] 4. Move UI helpers (item list/delta labels, skill color map) into `src/app/ui/`.
- [x] 5. Wire extracted components/hooks into `App.tsx` with stable props and minimal state churn.
- [x] 6. Add interaction-focused tests: modal open/close + inventory hook outputs.
- [x] 7. Validate via React Profiler (qualitative) and run lint/tests.
- [x] FINAL: Update backlog/task docs and confirm acceptance criteria.

# Report
1. Added modal components (`ModalShell`, `LoadoutModal`, `HeroNameModal`, `SystemModal`, `OfflineSummaryModal`) and moved item formatting + skill colors into UI helpers.
2. Introduced hooks (`useInventoryView`, `usePendingActionSelection`, `useActionStatus`) and rewired `App.tsx` to use them while keeping behavior unchanged.
3. Added interaction tests for modal closing and inventory view hook output; ran `npm run lint`, `npm run test:ci`, `npm run tests`, and `npm run coverage`.
4. React Profiler check completed (App and panels render as expected during tab/modal interactions).

# Validation
- npm run tests
- npm run lint

# Notes
