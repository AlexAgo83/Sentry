## task_060_dungeon_progression_attribution_parity_tests - Dungeon progression attribution + parity tests
> From version: 0.9.8
> Understanding: 94%
> Confidence: 93%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_074_dungeon_progression_parity_tests.md`

# Decisions
- `combatActiveMsByPlayer` credits only heroes alive at step start.
- Parity compares full end state (status, floor, party HP, inventory deltas, Combat XP).
- Tests live in `tests/core/dungeon/*.test.ts`.

# Plan
- [x] 1. Update `combatActiveMsByPlayer` attribution to only include heroes alive at step start.
- [x] 2. Add parity tests (bulk offline delta vs step ticks) for identical end state.
- [x] 3. Add event-cap critical-only logging test.
- [x] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
- Updated combat active attribution to use step-start survivors and expanded parity assertions in tests.
