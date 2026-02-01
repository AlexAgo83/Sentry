## task_030_quests_screen - Quests screen + milestone quests
> From version: 0.8.17
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_035_quests_screen.md`.
- Implements `logics/backlog/item_035_quests_screen.md`.
- Adds a Quests screen with shop-like layout and milestone quests for equipables + skills.
- Quests are shared across heroes (account-wide), not per-character.
- System should stay extensible for future quest types (lore, exploration, collections, etc.).

# Plan
- [x] 1. Data definitions: create quests list from equipable recipes + skills (static file, deterministic order).
- [x] 2. Progress logic: compute craft count + skill level completion, including progress text.
  - Ensure progress/completion is shared across heroes.
- [x] 3. Rewards: apply gold formula and surface it on each quest card.
- [x] 4. Screen UI: build Quests screen with Shop layout + quest cells (fade completed).
- [x] 5. Sorting: active quests first, completed last (keep all visible).
- [x] 6. Navigation:
  - Desktop: add header button after Shop.
  - Mobile: add Quests entry inside Travel menu.
- [x] 7. Tests (new + updates):
  - Quests list renders with correct counts and progress text.
  - Completion + fade state works when thresholds met.
  - Navigation entries appear in header + Travel menu.
- [x] FINAL: Update related Logics docs (request/backlog indicators if needed).

# Validation
- npm run lint
- npm run typecheck
- npm run typecheck:tests
- npm run test:ci

# Report
- Notes: Quests are account-wide; completion auto-rewards gold once and fades in UI.
- Files touched: src/data/quests.ts, src/core/types.ts, src/core/state.ts, src/core/loop.ts, src/core/serialization.ts, src/app/AppView.tsx, src/app/AppContainer.tsx, src/app/hooks/useAppShellUi.ts, src/app/components/SidePanelSwitcher.tsx, src/app/components/QuestsPanel.tsx, src/app/containers/QuestsPanelContainer.tsx, src/app/containers/AppViewContainer.tsx, src/app/styles/stats-action.css, tests/app/questsPanel.test.tsx, tests/app/appView.questsNav.test.tsx, tests/app/appView.mobileRoster.test.tsx, tests/app/bottomBarAutoHide.test.tsx
- Tests: npm run lint, npm run typecheck, npm run typecheck:tests, npm run test:ci

# Notes
