## item_074_dungeon_progression_parity_tests - Dungeon progression attribution + parity tests
> From version: 0.9.8
> Understanding: 94%
> Confidence: 93%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Combat-active time can be credited to dead heroes, and offline catch-up parity is not explicitly validated by tests.

# Scope
- In:
- Credit `combatActiveMsByPlayer` only to heroes alive at step start.
- Add automated tests for offline parity (bulk delta vs step ticks).
- Add automated test for event-cap critical-only logging.
- Out:
- No combat rule changes.

# Decisions
- Parity compares full end state (status, floor, party HP, inventory deltas, Combat XP).
- `combatActiveMsByPlayer` uses alive-at-step-start rule.
- Tests live in `tests/core/dungeon/*.test.ts` (or a dedicated dungeon test file).

# Acceptance criteria
- Dead heroes do not receive combat-active time.
- Parity test passes with identical end state across bulk vs step simulation.
- Event cap test passes with critical events preserved.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_022_dungeon_gameplay_logic_optimizations.md`.
