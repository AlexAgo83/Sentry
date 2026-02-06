## item_072_dungeon_combat_step_perf_cache - Dungeon combat per-step perf caching
> From version: 0.9.8
> Understanding: 88%
> Confidence: 88%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Dungeon combat recomputes effective stats and derived combat values multiple times per step. This adds CPU cost and slows offline catch-up.

# Scope
- In:
- Cache per-hero effective stats per step (Agility, Strength).
- Cache derived values per step (attack interval, base damage).
- Pre-index party lookups and compute alive hero IDs once per step.
- Out:
- No combat rule changes or balance tweaks.

# Acceptance criteria
- Effective stats and derived values are computed once per hero per step.
- No change in combat outcomes with identical seed/state.
- Offline catch-up shows reduced per-tick compute cost (profiling/telemetry if available).

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_022_dungeon_gameplay_logic_optimizations.md`.
