## task_035_split_monolithic_recipes_and_panel_css - Split monolithic recipes and panel CSS
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_040_split_recipes_and_panel_css.md`.
Split recipes by skill and CSS by panel, keeping a stable import facade and order.

# Plan
- [ ] 1. Split `recipes.ts` into per-skill modules and re-export via a central index.
- [ ] 2. Split large panel CSS into per-panel files with explicit import order.
- [ ] 3. Update imports and verify no visual/regression drift.
- [ ] 4. Add or update notes about CSS import order.
- [ ] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npm run lint
- npm run build

# Report
- Status: not started.
