## task_052_add_agility_based_attack_cadence_runtime - Add agility-based attack cadence runtime
> From version: 0.9.5
> Understanding: 95%
> Confidence: 91%
> Progress: 100%

# Context
Derived from `logics/backlog/item_066_add_agility_based_attack_cadence_runtime.md`.

This task replaces the fixed dungeon attack rhythm with per-hero cooldown cadence driven by Agility, while preserving determinism and runtime safety.

# Decisions (v1)
- Default `baseAttackMs` to `DUNGEON_SIMULATION_STEP_MS` when no archetype value exists.
- Use `attackIntervalMs = clamp(250, 1400, round(baseAttackMs / (1 + agility * 0.02)))` for cooldown resets.
- Resolve interval on each cooldown reset using current effective Agility, plus snapshot `agilityAtRunStart` for replay metadata.
- Initialize `attackCooldownMs` to the resolved interval on run start/restart and on hydrate if missing.
- Enforce `max 3 attacks / hero / step` and stop additional attacks after the cap.
- Add a per-step event cap; after hitting it, drop `attack` and `damage` events but keep `death` and `run_end`.
- Preserve deterministic targeting (lowest HP + stable tie-break) and retarget only after hero phase.

# Suggestions (v1 defaults)
- Default `baseAttackMs` to `DUNGEON_SIMULATION_STEP_MS` when no archetype value exists, so baseline cadence matches current feel.
- Use `attackIntervalMs = clamp(250, 1400, round(baseAttackMs / (1 + agility * 0.02)))` as the single source for cooldown resets.
- Resolve interval on each attack reset using current effective Agility; also snapshot `agilityAtRunStart` for replay metadata.
- Initialize `attackCooldownMs` to the resolved interval on run start/restart and on hydrate if missing, to avoid a resume burst.
- When the per-hero cap hits, stop additional attacks for that hero and clamp cooldown to `0` so cadence resumes next step.
- Add a per-step event cap; once reached, drop non-critical events (`attack`, `damage`) but still allow `death` and `run_end`.

# Open questions to confirm
- Should cadence use dynamic Agility (buffs/debuffs mid-run) or snapshot Agility at run start for all resets?
- If the cap hits, should cooldown underflow be preserved (carry-over) or reset to zero?

# Plan
- [x] 1. Extend dungeon run state for cadence:
  - Add per-hero attack cooldown runtime fields.
  - Ensure defaults are initialized on run start/restart and safely normalized on hydrate.
- [x] 2. Implement Agility-based cooldown formula:
  - Add data-driven `baseAttackMs`.
  - Apply clamped + diminishing-returns conversion to resolve effective interval.
- [x] 3. Rework hero attack loop to cooldown-driven execution:
  - Decrement cooldown each simulation step.
  - Trigger attacks only on cooldown readiness.
  - Support multi-proc (`while cooldown <= 0`) under large `deltaMs`.
- [x] 4. Keep v1 enemy cadence fixed and preserve deterministic target ordering.
- [x] 5. Add runtime guardrails:
  - Per-hero attack cap per step.
  - Stable behavior across online tick and offline catch-up paths.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Added cooldown cadence runtime fields (`attackCooldownMs`) with safe initialization on run start/restart/hydrate.
- Implemented Agility-driven attack interval formula with clamp bounds and diminishing returns.
- Reworked hero attack loop to cooldown + multi-proc with per-hero cap and deterministic targeting.
- Preserved fixed enemy cadence and added cadence snapshot data for replay/observability.

