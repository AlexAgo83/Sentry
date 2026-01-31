## task_030_quests_screen - Quests screen + milestone quests
> From version: 0.8.17
> Understanding: 90%
> Confidence: 85%
> Progress: 0%

# Context
- Implements `logics/backlog/item_035_quests_screen.md`.
- Adds a Quests screen with shop-like layout and milestone quests for equipables + skills.

# Plan
- [ ] 1. Data definitions: create quests list from equipable recipes + skills (static file, deterministic order).
- [ ] 2. Progress logic: compute craft count + skill level completion, including progress text.
- [ ] 3. Rewards: apply gold formula and surface it on each quest card.
- [ ] 4. Screen UI: build Quests screen with Shop layout + quest cells (fade completed).
- [ ] 5. Sorting: active quests first, completed last (keep all visible).
- [ ] 6. Navigation:
  - Desktop: add header button after Shop.
  - Mobile: add Quests entry inside Travel menu.
- [ ] 7. Tests (new + updates):
  - Quests list renders with correct counts and progress text.
  - Completion + fade state works when thresholds met.
  - Navigation entries appear in header + Travel menu.
- [ ] FINAL: Update related Logics docs (request/backlog indicators if needed).

# Validation
- npm run lint
- npm run typecheck
- npm run typecheck:tests
- npm run test:ci

# Report
- Notes:
- Files touched:
- Tests:
