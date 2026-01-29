## item_022_tablet_equipment_slot_and_charges - Tablet equipment slot and charges
> From version: 0.8.11
> Understanding: 94%
> Confidence: 90%
> Progress: 0%

# Problem
Tablets need to be equipable with a dedicated slot and a visible charge mechanic. Today there is no tablet slot and no charge tracking.

# Scope
- In:
  - Add a dedicated Tablet equipment slot, placed after Weapons.
  - Enforce single tablet equip (no multi-equip).
  - Add charges: 100 at start; decrement by 1 on each completed player action (including offline catch-up).
  - When charges reach 0, the tablet is removed after the action completes.
  - Charges persist on the tablet item; unequipping and re-equipping preserves remaining charges.
  - Charges are per-player (each player’s equipped tablet has its own charge count).
  - Show charges in item tooltip and as a badge on the equipment slot.
  - Update save schema + migrations for tablet equipment and charges.
  - Add tests for charge depletion and UI display.
  - If tablet items are missing in data definitions, add them (IDs, icons, metadata). Use placeholder icon if needed.
- Out:
  - No tablet gameplay effects beyond equip + charges (invocation effects are out of scope).
  - No charge display in inventory lists beyond tooltip/badge.
  - No empty-slot charge indicator.

# Acceptance criteria
- A Tablet slot appears after Weapons and allows only one equipped tablet.
- Charges start at 100 and decrement on each completed action (offline included).
- Tablet is removed when charges reach 0, after the action completes.
- Charges are visible in tooltip and equipment UI badge.
- Unequipping preserves remaining charges.
- Save migrations preserve existing saves and add tablet data safely.
- Tests cover depletion and UI display.

# Priority
- Impact: High (core equipment mechanic).
- Urgency: Medium.

# Notes
- Source: req_009_offline_roster_tablets.
- Related to req_007 invocation tablets skill (effects still out of scope).
