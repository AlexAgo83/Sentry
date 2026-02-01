## item_027_compact_number_formatting - Compact number formatting across UI
> From version: 0.8.13
> Understanding: 85%
> Confidence: 75%
> Progress: 100%

# Context
Large gold values and counts become hard to read in shop, inventory, action summaries, and recaps.

Source request: `logics/request/req_011_economy_action_inventory_cloud_qol.md`.

# Goal
Apply compact number formatting (K/M/B/T) with full values on tooltip/aria across the UI.

# Scope (v1)
- Shared formatter utility (compact + full).
- Apply to: shop price, sell gains, inventory count, action summary rewards, offline recap, cloud meta scores.
- Preserve precise values for logic/state.

# Acceptance
- Values >= 1,000 render compact (e.g. 1.25M).
- Full value is accessible via tooltip/aria.
- No rounding in saved values or calculations.

# Problem
Describe the problem and user impact.

# Scope
- In:
- Out:

# Acceptance criteria
- Define acceptance criteria

# Priority
- Impact:
- Urgency:

# Notes
