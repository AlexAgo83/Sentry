## task_073_dungeon_risk_tier_model - Compute risk tiers per dungeon
> From version: 0.9.10
> Owner: —
> Status: Planned
> Understanding: 95%
> Confidence: 93%
> Progress: 0%

# Summary
Compute a deterministic risk tier per dungeon based on current party or hero power.

# Dependencies
- item_087_dungeon_risk_tier_model

# Steps
1. Define a power selector (party power if a party is selected, otherwise active hero power).
2. Use `virtualScore` as the power metric.
3. Define tier thresholds and map ratio `power / recommended` to `Low/Medium/High/Deadly`.
4. Expose a helper or selector to retrieve the tier label for any dungeon.
5. Add a small unit test for threshold mapping.

# Decisions
- Tier labels: `Low`, `Medium`, `High`, `Deadly`.
- Thresholds:
  - `>= 1.2` -> Low
  - `0.9–1.19` -> Medium
  - `0.7–0.89` -> High
  - `< 0.7` -> Deadly

# Acceptance criteria
- Any dungeon has a computed risk tier based on current power.
- Tier updates when party/hero power changes.
- Mapping matches the thresholds exactly.
