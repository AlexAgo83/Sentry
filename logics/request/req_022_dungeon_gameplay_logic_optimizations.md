## req_022_dungeon_gameplay_logic_optimizations - Dungeon gameplay logic optimizations
> From version: 0.9.8
> Understanding: 95%
> Confidence: 92%

# Needs
- Reduce CPU cost and memory growth in the dungeon combat loop, especially during offline catch-up.
- Preserve deterministic outcomes and replay integrity while cutting redundant computation and event volume.
- Improve combat progression accounting so only active (alive) heroes accrue combat-active time.
- Keep combat rules readable and consistent across live and offline simulation paths.

# Context
- Dungeon combat is simulation-first and feeds live + replay visuals. Event volume and per-tick cost directly impact offline catch-up and save size.
- We already cap events per step and attacks per hero per step, but long offline windows can still balloon total event arrays before replay truncation.
- These changes should align with the cadence work from `req_020_combat_system_improvements_stats_and_offline_recap` and avoid regressions in replay determinism.
- Optimization changes must not bias offline results. Prefer computational optimizations and logging controls only.

# Goals
- Lower per-step compute by caching hero effective stats and pre-indexing party lookups.
- Bound total replay event growth during long offline catch-up sessions.
- Keep damage outcomes equivalent when event coalescing is used.
- Make combat-active time tracking more accurate for progression.

# Locked decisions (v1)
- Determinism remains mandatory: same seed + same initial state => same outcome and replay sequence (within truncation rules).
- Gameplay outcomes (damage, deaths, victory, wipe) must remain unchanged when only optimization paths are enabled.
- Optimization changes must not bias offline simulation outcomes.
- Combat rules are frozen for this request: no targeting changes, no balance tweaks.
- Attack event coalescing is out of scope for v1 (logging-only coalescing may be revisited later).
- Global event cap is required; start with `DUNGEON_TOTAL_EVENT_CAP = 10000` (single global constant, not per-dungeon).
- Parity tests must compare full end state (status, floor, party HP, inventory deltas, Combat XP) between step ticks and bulk offline delta.
- Add automated tests for offline parity and event cap behavior.

# Scope detail (draft)
- Simulation performance:
  - Cache per-hero effective stats once per simulation step (Agility, Strength, derived attack interval, base damage).
  - Pre-index `partyById` and compute alive hero IDs once per step to avoid repeated `find` and filter passes.
  - Avoid recomputing `resolveHeroEffectiveStats` multiple times per hero per step.
- Event volume controls:
  - Add a global run-level event cap (`DUNGEON_TOTAL_EVENT_CAP`) in addition to per-step caps.
  - Once the global cap is reached, record only critical events (`floor_start`, `boss_start`, `heal`, `death`, `run_end`) and increment `truncatedEvents`.
  - Keep replay truncation behavior consistent with existing `DUNGEON_REPLAY_MAX_EVENTS` and `DUNGEON_REPLAY_MAX_BYTES` safeguards.
- Combat progression accounting:
  - Only award `combatActiveMsByPlayer` to heroes that are alive during that step.

# Technical references to update
- `src/core/dungeon.ts`
- `src/core/types.ts` (only if new replay flags/counters are introduced)
- `src/core/loop.ts` (if progression attribution changes require update)

# Acceptance criteria
- Offline catch-up with a large delta does not grow `run.events` beyond `DUNGEON_TOTAL_EVENT_CAP`.
- Combat-active time is not credited to dead heroes.
- Replay remains deterministic with the same seed and initial state, within truncation rules.
- Parity test passes with identical end state across step ticks vs bulk offline delta.

# Validation plan (confidence boost)
- Parity test: same seed and initial state, compare results between step-by-step ticks and a single large offline delta. Assert identical end status, floor, party HP, inventory deltas, and Combat XP.
- Replay determinism test: same seed and initial state produce the same event sequence (or the same critical-event sequence if caps apply).
- Event cap test: simulate a long offline delta and assert `run.events.length <= DUNGEON_TOTAL_EVENT_CAP` and that critical events are still present.
- Progression attribution test: heroes with `hp <= 0` do not receive `combatActiveMsByPlayer`.

# Risks / open points
- Global event caps can reduce replay detail in long sessions; ensure critical events remain present.
- If on-hit effects are introduced later, any future event coalescing must be evaluated carefully.

# Backlog
- (none yet)
