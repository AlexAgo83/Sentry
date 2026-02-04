## item_053_dungeon_onboarding_roster_gate_and_fourth_hero_naming - Dungeon onboarding roster gate and fourth hero naming
> From version: 0.8.22
> Understanding: 96%
> Confidence: 92%
> Progress: 100%

# Problem
Dungeon flow requires a 4-hero party, but onboarding currently does not guarantee the right roster state or naming flow for the 4th hero.

# Scope
- In:
  - Start new saves with 3 procedurally generated heroes, including generated names, only when roster is empty.
  - Use an English name pool for generated starter heroes.
  - Prevent duplicate names across the 3 generated starter heroes.
  - Add mandatory creation and name entry for the 4th hero before dungeon flow is playable.
  - Keep Dungeon CTA visible but locked while roster size is below 4, with explanatory tooltip.
  - Keep compatibility with existing onboarding and save migration behavior.
- Out:
  - Advanced onboarding storytelling and cinematic tutorial steps.
  - New hero customization systems outside current creation flow.

# Acceptance criteria
- New saves with empty roster start with exactly 3 generated heroes and valid generated names.
- Existing saves that already have heroes never trigger auto-generation of those 3 starter heroes.
- Generated starter hero names use English naming and contain no duplicates.
- Dungeon flow cannot be entered until a 4th hero is created and saved.
- Locked Dungeon CTA state and unlock transition are visible and consistent on desktop and mobile.
- Existing saves are not broken by onboarding gate changes.

# Priority
- Impact: High (hard requirement for dungeon entry and flow coherence).
- Urgency: High (blocks dungeon feature usability).

# Notes
- Source request: `logics/request/req_018_group_idle_dungeon_combat_loop.md`
- Derived from `logics/request/req_018_group_idle_dungeon_combat_loop.md`.
