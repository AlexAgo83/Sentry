## item_107_extract_dungeon_constants_and_pure_formulas_into_dedicated_modules - Extract dungeon constants and pure formulas into dedicated modules
> From version: 0.9.24
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/core/dungeon.ts` currently mixes tuning constants and pure formulas with runtime orchestration logic. This makes basic balancing changes risky and hard to review.

# Scope
- In:
- Extract simulation/replay/tuning constants into `src/core/dungeon/constants.ts`.
- Extract pure formulas/helpers into `src/core/dungeon/formulas.ts` (attack interval, damage multipliers, armor reduction, XP/food formulas).
- Update imports in `src/core/dungeon.ts` to consume extracted modules without behavior changes.
- Out:
- No tick orchestration split yet.
- No lifecycle/start-stop extraction in this item.
- No balance changes.

# Acceptance criteria
- Constants and pure formulas are moved out of `src/core/dungeon.ts`.
- Existing public functions keep same output behavior for equivalent inputs.
- `npm run typecheck` and `npm run tests` pass with no gameplay regression.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_038_split_core_dungeon_module_into_domain_focused_files.md`.
- Key references: `src/core/dungeon.ts`.
