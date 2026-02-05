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

