## item_143_tune_drop_weights_and_balance_for_existing_and_exclusive_items - Tune drop weights and balance for existing and exclusive items
> From version: 0.9.28
> Understanding: 97%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Balance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Drop pools need calibrated probabilities and power scaling by dungeon difficulty to feel fair and rewarding.

# Scope
- In:
- Tune per-dungeon weights for common vs rare entries.
- Ensure higher-tier dungeons provide stronger loot pools than lower tiers.
- Validate rare exclusives remain aspirational but realistically obtainable.
- Document initial tuning rationale.
- Out:
- No UI architecture changes.

# Acceptance criteria
- Power progression across dungeon tiers is monotonic at pool level.
- Rare drop rates are meaningfully lower than common rates.
- Economy impact remains within acceptable bounds.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_044_dungeon_weighted_loot_tables_with_dungeon_exclusive_rare_items.md`.
- Main references: dungeon formulas/data tuning notes.
