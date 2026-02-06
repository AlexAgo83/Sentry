## task_063_weapon_category_combat_effects - Weapon category combat effects
> From version: 0.9.9
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_077_weapon_category_combat_effects.md`

# Decisions
- Magic: heal ally on `4000ms` cooldown; wearer takes +10% damage received.
- Heal triggers only if an ally is below `70%` HP.
- Heal blocked if the wearer is KO or stunned.
- Ranged: 50% faster attacks in dungeon (interval multiplier only); wearer takes +25% damage received.
- Melee: +25% threat on damage-only; wearer takes -10% damage received.
- Heal target: lowest %HP ally, deterministic tie-break by party order.
- No revive, no overheal.
- Damage received modifiers apply after Endurance mitigation.

# Plan
- [ ] 1. Add combat effect hooks for weapon categories in `src/core/dungeon.ts`.
- [ ] 2. Add per-hero cooldown state for magic heals (deterministic).
- [ ] 3. Apply damage received multipliers per category.
- [ ] 4. Apply ranged attack speed multiplier in dungeon only.
- [ ] 5. Apply melee threat multiplier on damage events only.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
- Applied weapon category effects in dungeon combat: magic ally heals with cooldown/threshold, ranged attack speed multiplier, melee threat bonus, and per-category damage taken modifiers.
- Added per-hero magic heal cooldown state with deterministic targeting and replay-safe events.
