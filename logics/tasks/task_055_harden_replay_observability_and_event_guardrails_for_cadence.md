## task_055_harden_replay_observability_and_event_guardrails_for_cadence - Harden replay observability and event guardrails for cadence
> From version: 0.9.5
> Understanding: 93%
> Confidence: 88%
> Progress: 0%

# Context
Derived from `logics/backlog/item_069_harden_replay_observability_and_event_guardrails_for_cadence.md`.

This task ensures cadence changes remain debuggable and bounded by replay/event safety limits under both online and offline execution.

# Decisions (v1)
- Persist a `cadenceSnapshot` with `baseAttackMs`, `agilityAtRunStart`, `resolvedAttackIntervalMs`, and clamp bounds.
- Enforce a per-step `eventCap`; after hitting it, drop `attack` and `damage` events but keep `death` and `run_end`.
- Keep `max 3 attacks / hero / step` aligned with cadence runtime guardrails.
- Track `truncatedEvents` in run metadata for tuning and debugging.

# Suggestions (v1 defaults)
- Persist a `cadenceSnapshot` on the run/replay with `baseAttackMs`, `agilityAtRunStart`, `resolvedAttackIntervalMs`, and clamp bounds.
- Add a per-step `eventCap` constant and drop non-critical events after the cap while still allowing `death` and `run_end`.
- Track a `truncatedEvents` counter in the run metadata so tuning/debugging can detect cap pressure.
- Keep hero ordering deterministic by iterating `party` in stable order and resolving target only after hero phase.

# Open questions to confirm
- Desired per-step `eventCap` value (and whether to allow a small critical-event overflow buffer)?
- Should `cadenceSnapshot` live in replay header or per-run metadata (and versioned)?

# Plan
- [ ] 1. Add cadence observability snapshot:
  - Persist cadence context in run/replay metadata (`baseAttackMs`, agility input, resolved interval).
- [ ] 2. Enforce event safety caps:
  - Keep per-hero attack cap per step.
  - Add global event cap per simulation step/cycle.
- [ ] 3. Validate replay compatibility:
  - Keep existing truncation limits/fallback behavior working with denser cadence output.
  - Ensure event ordering stability for deterministic playback.
- [ ] 4. Add targeted runtime + replay tests for high-delta/offline stress cases.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

