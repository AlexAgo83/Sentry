## task_064_weapon_category_tooltips_and_items - Weapon category tooltips and items
> From version: 0.9.9
> Understanding: 93%
> Confidence: 90%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_078_weapon_category_tooltips_and_items.md`

# Decisions
- Tooltip text lists category effects (benefits + tradeoffs) in 2–3 short lines.
- Keep existing Magic weapon (`Apprentice Staff`) for v1 (no baton item).

# Plan
- [ ] 1. Add/update weapon item definitions in `src/data/equipment.ts`.
- [ ] 2. Update item detail tooltip text in `src/app/ui/inventoryMeta.ts`.
- [ ] 3. Ensure tooltip displays category effects for Melee/Ranged/Magic weapons.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
