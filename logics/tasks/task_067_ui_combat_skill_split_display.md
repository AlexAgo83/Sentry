## task_067_ui_combat_skill_split_display - UI display for split combat skills
> From version: 0.9.9
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_081_ui_combat_skill_split_display.md`

# Decisions
- Stats and Dungeon show the three combat skills.
- Stats uses a single “Combat” section with 3 lines.
- Dungeon shows a compact mini-stack.
- Prefer category icons (sword/bow/staff); fallback to generic skill icons.
- Action screen remains unchanged.

# Plan
- [ ] 1. Update skill icon/label mappings for the new combat skills.
- [ ] 2. Update Stats panel to surface the three combat skills.
- [ ] 3. Update Dungeon UI to display the three combat skills where relevant.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
- Surfaced melee/ranged/magic combat skills in Stats with a single Combat section and new icons/colors.
- Updated dungeon party selection to show a compact combat skill mini-stack.
