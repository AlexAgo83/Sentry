## item_069_harden_replay_observability_and_event_guardrails_for_cadence - Harden replay observability and event guardrails for cadence
> From version: 0.9.5
> Understanding: 93%
> Confidence: 88%
> Progress: 0%

# Problem
Faster attack cadence increases event density, which can hurt replay debugability and payload stability if observability and guardrails are not upgraded.

# Scope
- In:
  - Persist cadence context in run/replay snapshot (base interval, agility input, resolved interval).
  - Add/confirm per-hero attack cap per simulation step.
  - Add a global event cap per step/cycle to prevent spikes during large offline catch-up.
  - Preserve deterministic event order under new cooldown runtime behavior.
  - Keep compatibility with existing replay truncation and critical-event fallback paths.
- Out:
  - Full replay format redesign.
  - External telemetry systems.

# Decisions (v1)
- Persist a `cadenceSnapshot` with `baseAttackMs`, `agilityAtRunStart`, `resolvedAttackIntervalMs`, and clamp bounds.
- Enforce a per-step `eventCap`; after hitting it, drop `attack` and `damage` events but keep `death` and `run_end`.
- Keep `max 3 attacks / hero / step` aligned with cadence runtime guardrails.
- Track `truncatedEvents` in run metadata for tuning and debugging.

# Recommended defaults (v1)
- Add a `cadenceSnapshot` with `baseAttackMs`, `agilityAtRunStart`, `resolvedAttackIntervalMs`, and clamp bounds.
- Enforce a per-step `eventCap` and allow only `death` and `run_end` events after the cap is reached.
- Track `truncatedEvents` in run metadata to flag cap pressure during tuning.

# Open questions
- Target per-step `eventCap` value and whether critical events should overflow the cap.
- Storage location for cadence metadata (replay header vs run metadata).

# Acceptance criteria
- Replay contains cadence metadata needed to diagnose speed/balance outcomes.
- Event generation remains bounded in high-delta scenarios.
- Replay determinism holds for same seed and initial state.
- Existing replay truncation/fallback protections still work.

# Priority
- Impact: Medium-High (runtime safety + debugging confidence).
- Urgency: Medium (must accompany cadence runtime changes).

# Notes
- Source request: `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`
- Derived from `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`.

