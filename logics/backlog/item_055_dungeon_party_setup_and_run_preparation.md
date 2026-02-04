## item_055_dungeon_party_setup_and_run_preparation - Dungeon party setup and run preparation
> From version: 0.8.22
> Understanding: 96%
> Confidence: 92%
> Progress: 95%

# Problem
Dungeon runs require a strict setup flow (dungeon selection, party composition, preparation) and clear hero eligibility rules before launch.

# Scope
- In:
  - Implement setup flow: select dungeon -> select 4 heroes -> configure preparation -> launch.
  - Enforce party size of exactly 4 heroes in v1.
  - Enforce hero exclusivity: assigned heroes cannot run other activities.
  - Add preparation stage using already equipped gear only plus carried resources setup.
  - Do not allow equipment edits from the dungeon preparation screen in v1.
  - Validate and block launch on invalid setup states.
- Out:
  - Raid-size parties (10+) and multi-party concurrent run execution.
  - Advanced tactical formations and role presets.

# Acceptance criteria
- Player cannot launch run with less or more than 4 selected heroes.
- Invalid hero states (already assigned/unavailable) are prevented with clear feedback.
- Preparation choices are captured and reflected in run start state.
- Preparation screen does not modify hero equipment; run uses currently worn equipment.
- Leaving setup without launch keeps previous game activity intact.

# Priority
- Impact: High (defines core player loop quality).
- Urgency: High (required before combat simulation starts).

# Notes
- Source request: `logics/request/req_018_group_idle_dungeon_combat_loop.md`
- Derived from `logics/request/req_018_group_idle_dungeon_combat_loop.md`.
