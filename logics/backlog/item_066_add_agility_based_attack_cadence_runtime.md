## item_066_add_agility_based_attack_cadence_runtime - Add agility-based attack cadence runtime
> From version: 0.9.5
> Understanding: 95%
> Confidence: 91%
> Progress: 0%

# Problem
Dungeon combat still relies on a mostly fixed attack rhythm, which limits the gameplay value of Agility and makes encounters feel too static.

# Scope
- In:
  - Introduce per-hero attack cooldown state in dungeon runtime.
  - Resolve attack cadence with Agility-based interval formula using clamp bounds.
  - Apply diminishing returns in Agility conversion to avoid runaway speed scaling.
  - Support multi-proc cooldown resolution for large deltas/offline catch-up.
  - Keep enemy cadence fixed in v1 for controlled balancing.
- Out:
  - Full enemy speed scaling by stats in v1.
  - Rework of damage formulas unrelated to cadence.

# Acceptance criteria
- Hero attacks are triggered by cooldown readiness, not one fixed global party strike cycle.
- Higher Agility results in shorter effective attack intervals within configured min/max bounds.
- Large `deltaMs` paths correctly resolve multiple attacks without infinite loops.
- Runtime remains deterministic for same seed and same initial state.

# Priority
- Impact: High (core combat feel + progression value).
- Urgency: High (foundation for combat system improvements in req_020).

# Notes
- Source request: `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`
- Derived from `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`.

