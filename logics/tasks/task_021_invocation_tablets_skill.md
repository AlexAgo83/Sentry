## task_021_invocation_tablets_skill - Invocation Tablets skill
> From version: 0.8.10
> Understanding: 90%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_019_invocation_tablets_skill.md`.

# Plan
- [x] 1. Add Invocation skill to core definitions (types, skill list, skill color/icon).
- [x] 2. Add Invocation Tablet item (equipment definition + inventory metadata + icon mapping).
- [x] 3. Add recipe definition and wire it to the Invocation skill.
- [x] 4. Ensure selection/equipment/inventory UI surfaces the new skill/item correctly.
- [x] 5. Add/adjust tests for skill list, recipes, and inventory/equipment visibility.
- [x] FINAL: Update progress + confirm acceptance criteria.

# Validation
- npm run tests
- npm run lint
- npm run typecheck

# Report
1. Added Invocation skill (types, definitions, icon, and color) and mapped it to Intellect-based XP scaling.
2. Added Invocation Tablet as an equippable Amulet item with inventory metadata.
3. Expanded Invocation to 10 named recipes with descriptions and scaling costs/rewards.
4. Confirmed lint, typecheck, and test suite all pass.

# Notes
