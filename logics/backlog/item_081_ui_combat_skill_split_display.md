## item_081_ui_combat_skill_split_display - UI display for split combat skills
> From version: 0.9.9
> Understanding: 94%
> Confidence: 90%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
The UI needs to surface the split combat skills where it matters without cluttering the action screen.

# Scope
- In:
- Show `CombatMelee`, `CombatRanged`, `CombatMagic` in Stats and Dungeon views.
- Keep Action screen unchanged/minimal.
- Out:
- No full UI redesign.

# Decisions
- Only Stats and Dungeon screens show split combat skills in v1.
- Stats uses a single “Combat” section with 3 lines.
- Dungeon shows a compact mini-stack.
- Prefer category icons (sword/bow/staff); fall back to generic skill icons if missing.

# Acceptance criteria
- Stats and Dungeon panels display the three combat skills.
- Action screen does not add new combat rows.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_025_split_combat_xp_by_weapon_type.md`.
