## item_023_virtual_score_in_setup_modal - Virtual score in setup modal
> From version: 0.8.11
> Understanding: 94%
> Confidence: 92%
> Progress: 0%

# Problem
Players need a quick, comparable score to help resolve cloud vs local save conflicts. The setup modal is the right place to display it.

# Scope
- In:
  - Compute a virtual score as the sum of all skill levels across all players.
  - Display it as a subtle muted line in the setup modal footer (e.g., "Virtual score: 128").
  - Always visible in the setup modal (not conditional on cloud state).
  - Compute live (no persistence), integer only.
  - Add a small UI test to confirm the label/value renders.
- Out:
  - No ranking/leaderboard.
  - No backend storage requirement beyond metadata already planned.
  - No per-player score breakdown in v1.

# Acceptance criteria
- The setup modal shows "Virtual score: X" using the sum of all players’ skill levels.
- The value updates when skills change.
- The display is visually subtle and does not disrupt existing layout.
- A UI test covers rendering the score line.

# Priority
- Impact: Low-Medium.
- Urgency: Low.

# Notes
- Source: req_009_offline_roster_tablets.
