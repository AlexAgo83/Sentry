## task_052_add_agility_based_attack_cadence_runtime - Add agility-based attack cadence runtime
> From version: 0.9.5
> Understanding: 95%
> Confidence: 91%
> Progress: 0%

# Context
Derived from `logics/backlog/item_066_add_agility_based_attack_cadence_runtime.md`.

This task replaces the fixed dungeon attack rhythm with per-hero cooldown cadence driven by Agility, while preserving determinism and runtime safety.

# Plan
- [ ] 1. Extend dungeon run state for cadence:
  - Add per-hero attack cooldown runtime fields.
  - Ensure defaults are initialized on run start/restart and safely normalized on hydrate.
- [ ] 2. Implement Agility-based cooldown formula:
  - Add data-driven `baseAttackMs`.
  - Apply clamped + diminishing-returns conversion to resolve effective interval.
- [ ] 3. Rework hero attack loop to cooldown-driven execution:
  - Decrement cooldown each simulation step.
  - Trigger attacks only on cooldown readiness.
  - Support multi-proc (`while cooldown <= 0`) under large `deltaMs`.
- [ ] 4. Keep v1 enemy cadence fixed and preserve deterministic target ordering.
- [ ] 5. Add runtime guardrails:
  - Per-hero attack cap per step.
  - Stable behavior across online tick and offline catch-up paths.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

