## task_062_dungeon_taunt_targeting_rules - Dungeon taunt + targeting rules
> From version: 0.9.8
> Understanding: 93%
> Confidence: 91%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_076_dungeon_taunt_targeting_rules.md`

# Decisions
- Taunt source: simple v1 flag on party member state.
- Taunt duration: `TAUNT_DURATION_MS = 2500`.
- Bosses always respect taunt.

# Plan
- [ ] 1. Add taunt fields (bonus + duration) and integrate with threat model.
- [ ] 2. Implement stickiness thresholds (normal vs boss) and boss taunt enforcement.
- [ ] 3. Add/adjust tests for taunt selection and boss stickiness.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
