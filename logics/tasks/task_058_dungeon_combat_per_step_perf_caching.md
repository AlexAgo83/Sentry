## task_058_dungeon_combat_per_step_perf_caching - Dungeon combat per-step perf caching
> From version: 0.9.8
> Understanding: 92%
> Confidence: 91%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_072_dungeon_combat_step_perf_cache.md`

# Decisions
- Cache is per step, recalculated each tick.
- Cache includes effective stats, attack interval, and base damage.
- No micro-profiling output (silent optimization).

# Plan
- [ ] 1. Identify repeated per-step computations in `src/core/dungeon.ts` (effective stats, attack interval, base damage, party lookups).
- [ ] 2. Implement per-step caches and pre-indexed party/hero lookups; keep combat outcomes identical.
- [ ] 3. Verify determinism via existing tests and adjust if needed.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
