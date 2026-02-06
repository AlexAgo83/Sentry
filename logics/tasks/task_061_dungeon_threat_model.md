## task_061_dungeon_threat_model - Dungeon threat model
> From version: 0.9.8
> Understanding: 93%
> Confidence: 91%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_075_dungeon_threat_model.md`

# Decisions
- Threat scope is per floor wave (shared across enemies).
- Healing threat includes potion auto-heal.
- Decay rate: `THREAT_DECAY = 0.95` per step.

# Plan
- [ ] 1. Add threat state (per wave) and deterministic tie-break order in `src/core/dungeon.ts`.
- [ ] 2. Update combat events to accumulate threat from damage and healing with per-step decay.
- [ ] 3. Wire target selection to highest threat with deterministic tie-breaks; add coverage if needed.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
