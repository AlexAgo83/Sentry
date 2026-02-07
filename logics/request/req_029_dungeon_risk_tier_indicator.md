## req_029_dungeon_risk_tier_indicator - Show per-dungeon risk tier based on player power
> From version: 0.9.10
> Understanding: 68%
> Confidence: 60%

# Needs
- Show a visible difficulty tier per dungeon to guide selection.
- Tier must be based on the player or party current power.

# Context
- Players need quick guidance on whether a dungeon is safe or risky.
- The tier should adjust as the player or party grows.

# Goals
- Compute a risk tier per dungeon from current power.
- Display the tier in the dungeon selection list and any relevant dungeon UI.
- Keep the label compact and readable.

# Locked decisions (v1)
- The UI shows a short label like `Risque: Moyen`.
- The tier is derived from current player or party power (not static).
- This is a guidance indicator only (no hard lock).

# Scope detail (draft)
- Data:
  - Compute an effective power score for the current player or selected party.
  - Compare it to dungeon difficulty or recommended power.
- UI:
  - Show the tier in the dungeon selection cell.
  - Optionally show it in the dungeon detail view or header.
- UX:
  - Keep tiers to a small set (ex: Low / Medium / High / Deadly).
  - Use consistent coloring with existing dungeon UI accents.

# Technical references to update
- `src/core/dungeon.ts` (power vs difficulty comparison)
- `src/app/components/DungeonScreen.tsx`
- `src/app/components/dungeon/*`
- `src/app/styles/panels/dungeon.css`

# Acceptance criteria
- Each dungeon cell displays a risk tier label based on current power.
- The tier updates when player or party power changes.
- The label is compact and readable on desktop and mobile.

# Risks / open points
- Define the exact tier thresholds and labels.
- Decide whether to use solo player power or party power for group dungeons.
- Localization for the `Risque` label.

# Backlog
- To be split after approval.
