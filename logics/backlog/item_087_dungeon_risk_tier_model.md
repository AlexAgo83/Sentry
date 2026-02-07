## item_087_dungeon_risk_tier_model - Compute risk tiers per dungeon
> From version: 0.9.10
> Understanding: 95%
> Confidence: 93%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Players need a clear, dynamic risk indicator per dungeon based on current power.

# Scope
- In:
- Define a power score for the active player or party.
- Define tier thresholds and labels (ex: Low / Medium / High / Deadly).
- Compute a per-dungeon risk tier from power vs dungeon difficulty.
- Out:
- No changes to dungeon balance or rewards.
- No auto-blocking of dungeon access.

# Decisions
- Use party power when a dungeon party is selected; otherwise use the active hero power.
- Power metric: `virtualScore`.
- Tier count: 4.
- Tier labels (English): `Low`, `Medium`, `High`, `Deadly`.
- Thresholds use ratio `power / recommended`:
  - `>= 1.2` -> Low
  - `0.9–1.19` -> Medium
  - `0.7–0.89` -> High
  - `< 0.7` -> Deadly
- Expose a simple label payload for UI use.

# Acceptance criteria
- Risk tier can be computed for any dungeon given player/party power.
- Tier updates when power changes.
- Tier output matches the thresholds and is deterministic.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_029_dungeon_risk_tier_indicator.md`.
