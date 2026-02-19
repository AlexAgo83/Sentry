## item_179_req054_wire_new_tab_to_setup_flow_with_concurrent_limit_guardrails - req054 wire New tab to setup flow and party selection guardrails
> From version: 0.9.36
> Understanding: 95%
> Confidence: 89%
> Progress: 100%
> Complexity: Medium
> Theme: UX Flow / Party Selection
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`New` setup context must coexist with active runs without unsafe interactions. Setup also needs clear guardrails so already-assigned heroes cannot be reused.

# Scope
- In:
- Wire `New` tab selection to existing `DungeonSetupView` while active runs continue in background.
- In `New` context, make run-scoped actions (including `Stop`) hidden or disabled.
- In party picker, keep heroes assigned to active runs visible but disabled.
- Add explicit `In dungeon` state indicator on unavailable heroes.
- Ensure setup primary CTA label is `Start new dungeon`.
- Out:
- Introducing a product-level max concurrent run guard (explicitly out of req054).
- Replay behavior changes (replay stays global).

# Acceptance criteria
- `New` always opens setup when at least one run is active.
- `Stop` is not actionable while setup/New context is selected.
- Heroes already assigned to active runs cannot be selected for the new party.
- Unavailable heroes are visibly marked `In dungeon`.
- Starting from `New` creates a run and returns focus to its run tab.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_054_multi_dungeon_parallel_runs_with_tab_navigation.md`.
- Filename kept for traceability; req054 does not enforce a concurrent count cap.
- Likely touch points:
  - `src/app/components/DungeonScreen.tsx`
  - `src/app/components/dungeonScreen/components/DungeonSetupView.tsx`
  - `src/app/components/dungeonScreen/components/DungeonHeaderActions.tsx`
  - `src/app/containers/DungeonScreenContainer.tsx`
  - `src/app/styles/panels/dungeon.css`
