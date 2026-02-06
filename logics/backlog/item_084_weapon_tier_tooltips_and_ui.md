## item_084_weapon_tier_tooltips_and_ui - Expose new weapon tiers in UI
> From version: 0.9.9
> Understanding: 86%
> Confidence: 80%
> Progress: 10%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Players need to see and understand the new weapon tiers and their component requirements in the UI.

# Scope
- In:
- Display new weapon tiers in crafting lists.
- Update item detail tooltips to include new tier effects and component notes.
- Out:
- No changes to overall inventory layout.

# Decisions
- Tooltips mention the “new-for-weapons” component explicitly.
- New tiers appear in crafting list ordered by unlock level.
- Tooltip line format: `New component: <ItemName>`.

# Acceptance criteria
- New weapon tiers show up in crafting UI.
- Item tooltips display updated tier info.

# Priority
- Impact: Low
- Urgency: Medium

# Notes
- Derived from `logics/request/req_027_weapon_tiers_and_new_components.md`.
