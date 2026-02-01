## item_026_roster_cap_ui_and_disable_purchase - Roster cap UI + disable purchase
> From version: 0.8.13
> Understanding: 85%
> Confidence: 75%
> Progress: 100%

# Context
Roster size upgrades become confusing once the cap is reached. The UI needs to communicate the cap clearly and stop purchases everywhere.

# Goal
Make the roster cap explicit and block upgrades when the cap is reached.

# Scope (v1)
- Define a roster cap (default: 20).
- Disable the roster upgrade action in the reducer when cap is reached.
- Shop tile shows “Maxed” state + short warning line.

# Acceptance
- Purchase action is ignored when rosterLimit >= cap.
- Shop shows a disabled button and a "Roster cap reached" message.
- Cap is visible in the roster upgrade tile (current / max).

# Notes
- Keep the cap value centralized in constants.

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
