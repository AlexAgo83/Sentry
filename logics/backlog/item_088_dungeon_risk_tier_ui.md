## item_088_dungeon_risk_tier_ui - Display risk tiers in dungeon UI
> From version: 0.9.10
> Understanding: 95%
> Confidence: 93%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Players need to see the risk tier directly in the dungeon selection UI.

# Scope
- In:
- Show `Risk: <Tier>` in dungeon selection cells.
- Style tiers with compact labels and consistent color accents.
- Out:
- No new screen or major UI redesign.

# Decisions
- Label format: `Risk: <Tier>`.
- Colors: Low=green, Medium=yellow, High=orange, Deadly=red.
- Show only in the dungeon selection cell (v1).
- The label must fit within the cell without wrapping on desktop.
- Include a subtle tooltip: `Based on current party power` (desktop hover only).

# Acceptance criteria
- Dungeon selection cells display the risk tier label.
- Labels update when player/party power changes.
- Label remains readable on mobile and desktop.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_029_dungeon_risk_tier_indicator.md`.
