## item_078_weapon_category_tooltips_and_items - Weapon category tooltips and items
> From version: 0.9.9
> Understanding: 94%
> Confidence: 91%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Weapon category effects must be communicated clearly in item detail views, and a baton item may need to be added.

# Scope
- In:
- Add/update weapon item definitions as needed (including baton).
- Add item detail tooltips that list category effects (Melee/Ranged/Magic).
- Out:
- No UI redesign beyond the tooltip content.

# Decisions
- Tooltips explicitly list benefits and tradeoffs in 2–3 short lines.
- Effects are described by category, not just by item.
- Keep the existing Magic weapon (`Apprentice Staff`) for v1 (no new baton item yet).

# Acceptance criteria
- Weapon item detail shows a concise tooltip for its category effects.
- Magic category uses the existing staff item in v1.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_024_weapon_rework_staff_bow_sword.md`.
