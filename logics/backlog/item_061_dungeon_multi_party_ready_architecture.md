## item_061_dungeon_multi_party_ready_architecture - Dungeon multi-party ready architecture
> From version: 0.8.22
> Understanding: 92%
> Confidence: 85%
> Progress: 0%

# Problem
Even with one active party in v1, the architecture must avoid singleton assumptions so future concurrent parties across different dungeons do not require a rewrite.

# Scope
- In:
  - Define run/party state shape with party identifiers and dungeon identifiers.
  - Keep architecture future-ready for up to 3 concurrent groups as a soft target.
  - Keep runtime APIs/selectors extensible to collections of runs, while enforcing one active run in v1.
  - Add guardrails and comments/contracts to prevent reintroducing singleton-only coupling.
  - Validate save schema compatibility for future expansion.
- Out:
  - Enabling actual concurrent multi-party gameplay in v1.
  - Raid orchestration UI for multiple live run cards.

# Acceptance criteria
- Core state and selectors can represent multiple runs without schema redesign.
- v1 behavior still enforces single active party/run.
- No hardcoded assumptions block adding up to 3 concurrent run slots in a follow-up item.
- Save schema migration path is documented.

# Priority
- Impact: Medium (reduces future rewrite risk).
- Urgency: Medium (should be shaped early to avoid debt).

# Notes
- Source request: `logics/request/req_018_group_idle_dungeon_combat_loop.md`
- Derived from `logics/request/req_018_group_idle_dungeon_combat_loop.md`.
