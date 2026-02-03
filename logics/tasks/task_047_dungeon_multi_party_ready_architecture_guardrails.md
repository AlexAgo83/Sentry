## task_047_dungeon_multi_party_ready_architecture_guardrails - Dungeon multi-party ready architecture guardrails
> From version: 0.8.22
> Understanding: 91%
> Confidence: 84%
> Progress: 0%

# Context
Derived from:
- `logics/backlog/item_061_dungeon_multi_party_ready_architecture.md`

This task is an architecture hardening pass so v1 (single active party) does not block future expansion to multiple concurrent dungeon groups.

# Plan
- [ ] 1. Define run/party state structures with explicit IDs and collection-based selectors/APIs.
- [ ] 2. Enforce single active run in v1 via policy/guards while keeping internals compatible with up to 3 future concurrent groups.
- [ ] 3. Remove or isolate singleton assumptions in runtime/reducer paths touched by dungeon systems.
- [ ] 4. Add save schema notes/migration plan for future multi-run extension.
- [ ] 5. Add focused tests proving v1 single-run behavior and multi-run data-shape compatibility.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
