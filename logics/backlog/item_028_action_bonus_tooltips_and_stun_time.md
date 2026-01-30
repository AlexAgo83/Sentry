## item_028_action_bonus_tooltips_and_stun_time - Action bonus tooltips + stun time
> From version: 0.8.13
> Understanding: 85%
> Confidence: 75%
> Progress: 40%

# Context
Players see bonus labels but not the formulas; stun time is currently implicit.

# Goal
Explain action bonus formulas and show stun time when stamina is 0.

# Scope (v1)
- Add tooltips for Agility time reduction and Intellect XP bonus.
- Display a separate “Stun time” line when stamina <= 0.
- Apply in Action panel and Action selection summary.

# Acceptance
- Tooltips show the formula and computed %.
- Stun time line appears only when stamina <= 0.
