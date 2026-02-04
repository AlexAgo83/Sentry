## task_047_dungeon_multi_party_ready_architecture_guardrails - Dungeon multi-party ready architecture guardrails
> From version: 0.8.22
> Understanding: 91%
> Confidence: 84%
> Progress: 100%

# Context
Derived from:
- `logics/backlog/item_061_dungeon_multi_party_ready_architecture.md`

This task is an architecture hardening pass so v1 (single active party) does not block future expansion to multiple concurrent dungeon groups.

# Plan
- [x] 1. Define run/party state structures with explicit IDs and collection-based selectors/APIs.
- [x] 2. Enforce single active run in v1 via policy/guards while keeping internals compatible with up to 3 future concurrent groups.
- [x] 3. Remove or isolate singleton assumptions in runtime/reducer paths touched by dungeon systems.
- [x] 4. Add save schema notes/migration plan for future multi-run extension.
- [x] 5. Add focused tests proving v1 single-run behavior and multi-run data-shape compatibility.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Completed in code:
  - Added collection-based dungeon run selectors (`getDungeonRuns`, `getActiveDungeonRunIds`, `getActiveDungeonRuns`) and kept `getActiveDungeonRun` as a v1 primary-run helper.
  - Enforced v1 single active run through policy guardrails while preserving future-ready policy shape (`maxConcurrentSupported`/`maxConcurrentEnabled`).
  - Isolated singleton coupling in runtime paths by using collection-based player locking and active-run assignment checks.
  - Preserved run collection state for compatibility (finalized runs remain representable in `dungeon.runs`).
  - Added tests for v1 single-run enforcement and multi-run-shaped selector compatibility.
