## task_061_dungeon_threat_model - Dungeon threat model
> From version: 0.9.8
> Understanding: 90%
> Confidence: 88%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_075_dungeon_threat_model.md`

# Plan
- [ ] 1. Add threat state (per wave) and deterministic tie-break order in `src/core/dungeon.ts`.
- [ ] 2. Update combat events to accumulate threat from damage and healing with per-step decay.
- [ ] 3. Wire target selection to highest threat with deterministic tie-breaks; add coverage if needed.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
