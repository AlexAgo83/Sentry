## task_012_app_ui_extractions - Execute backlog item 012
> From version: 0.7.2
> Understanding: 96%
> Confidence: 90%
> Progress: 0%

# Context
This task executes `item_012_app_ui_extractions`.

# Plan
- [ ] 1. Create `ModalShell` and extract Loadout/System/OfflineSummary modals into components.
- [ ] 2. Replace Recruit/Rename with a shared `HeroNameModal` component (keep behavior identical).
- [ ] 3. Extract hooks for inventory view, pending action selection, and action status derived data.
- [ ] 4. Move UI helpers (item list/delta labels, skill color map) into `src/app/ui/`.
- [ ] 5. Wire extracted components/hooks into `App.tsx` with stable props and minimal state churn.
- [ ] 6. Add interaction-focused tests: modal open/close + inventory hook outputs.
- [ ] 7. Validate via React Profiler (qualitative) and run lint/tests.
- [ ] FINAL: Update backlog/task docs and confirm acceptance criteria.

# Report
Pending.
