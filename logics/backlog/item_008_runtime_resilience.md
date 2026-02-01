## item_008_runtime_resilience - Tick timing accuracy + persistence safety
> From version: 0.5.0
> Understanding: 96%
> Confidence: 92%
> Progress: 100%

# Context
The runtime tick currently applies a fixed delta on normal frames and may lose real elapsed time under load. Persistence writes also do not guard against storage failures.

# Goal
Make tick timing reflect real elapsed time and harden persistence so gameplay does not break under storage errors.

# Needs
- Use real elapsed time for `deltaMs` on non-offline ticks (or adjust with a smoothing strategy that does not drop time).
- Clamp negative/invalid deltas to safe values.
- Guard `localStorage.setItem` with error handling and fallbacks.
- Add tests that simulate delayed ticks and storage quota errors.
- Introduce a max catch-up cap per tick to avoid single-frame jumps.
- Throttle or batch persistence writes to avoid saving every tick.

# Defaults (proposal)
- If `diff` is below the offline threshold, use `diff` instead of `loopInterval`.
- Clamp `deltaMs` to `[0, offlineThreshold * loopInterval]` when not running offline ticks.
- Cap per-tick catch-up to 500ms to avoid a single large jump.
- On save errors, log once, keep the runtime loop running, and disable persistence after 3 consecutive failures.
- Persist at a fixed interval (e.g., every 1–2s) or on significant state changes, not every tick.

# Scope (v1)
- No change to the offline summary format.
- No change to `LOOP_INTERVAL` default.

# Acceptance
- Under main-thread stalls, progress and action timing match elapsed real time.
- Storage failures do not crash the runtime or reset the UI.
- Tests cover delayed tick handling and storage failure paths.
- Catch-up is bounded so a single tick does not jump excessively.
- Persistence is throttled and does not run every tick.

# Open questions
- None for v1.

# Test coverage
- Delayed ticks: 1s, 5s, 20s stalls.
- Persistence failures: simulate quota errors and ensure runtime continues.

# Problem
Describe the problem and user impact.

# Scope
- In:
- Out:

# Acceptance criteria
- Define acceptance criteria

# Priority
- Impact:
- Urgency:

# Notes
