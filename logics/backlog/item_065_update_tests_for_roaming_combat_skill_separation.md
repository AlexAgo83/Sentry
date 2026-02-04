## item_065_update_tests_for_roaming_combat_skill_separation - Update tests for roaming/combat skill separation
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Problem
The roaming/combat split changes core progression semantics and can silently regress without targeted test coverage across runtime, UI, persistence, and offline paths.

# Scope
- In:
  - Add unit tests proving roaming increments `Roaming` and never increments `Combat`.
  - Add unit/integration tests proving dungeon grants Combat XP with floor + boss bonus rules.
  - Add UI tests proving `Combat` does not appear in Action selection.
  - Add regression checks for offline dungeon catch-up Combat XP and save serialization compatibility.
- Out:
  - Broad non-related test suite refactors.
  - Visual snapshot overhaul for all screens.

# Acceptance criteria
- New test cases cover all req_019 acceptance points tied to behavior split.
- CI-local validation commands pass with new tests included.
- No existing dungeon/action/persistence tests regress due to the split.

# Priority
- Impact: High (prevents hidden logic regressions).
- Urgency: Medium (must land with feature changes before release cut).

# Notes
- Source request: `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`
- Derived from `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`.
