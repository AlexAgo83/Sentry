## task_060_dungeon_progression_attribution_parity_tests - Dungeon progression attribution + parity tests
> From version: 0.9.8
> Understanding: 90%
> Confidence: 88%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_074_dungeon_progression_parity_tests.md`

# Plan
- [ ] 1. Update `combatActiveMsByPlayer` attribution to only include heroes alive at step start.
- [ ] 2. Add parity tests (bulk offline delta vs step ticks) for identical end state.
- [ ] 3. Add event-cap critical-only logging test.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
