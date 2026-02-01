## item_007_inventory_focus_panel - Inventory focus panel + grid layout
> From version: 0.4.1
> Understanding: 96%
> Confidence: 92%
> Progress: 100%

# Context
The current inventory is a simple list. We need a more visual grid layout and a focused detail panel for the selected item.

# Goal
Upgrade the Inventory screen into a Minecraft-like grid and add a dedicated panel that shows details for the selected item.

# Needs
- Inventory items displayed as grid slots (square cells).
- A focus panel that updates when an item is selected.
- Focus panel shows item name, description, and current count.
- The focus panel lives within the Inventory view (same column/row layout as other panels).
- If no item is selected, show a neutral empty-state in the focus panel.

# Defaults (proposal)
- Grid renders only existing items (no empty slots) with fixed-size slots (64px), subtle borders, and hover highlights.
- Grid layout: 6 columns on desktop, 3 columns on mobile, 8px gap between slots.
- Slots use item-specific SVG glyphs.
- Selected slot shows a 2px accent outline.
- Focus panel includes:
  - Title: item name (or "No item selected").
  - Count: current quantity.
  - Description copy per item.
  - "Clear" action to deselect (also allow clicking the selected slot to deselect).
- Empty state text: "Select an item to view details."
- Layout: focus panel to the right on desktop, below the grid on mobile (12px top margin).
- Data shape (v1): `items[]` with `{ id, name, count, description, icon }`, `selectedItemId`.
- Skip keyboard navigation in v1.

# Scope (v1)
- Visual grid only; no drag/drop yet.
- Short descriptions and SVG icons are included; no detailed item stats/effects yet.
- Works on desktop and mobile (grid wraps).

# Acceptance
- Inventory panel renders items in a grid with item glyphs.
- Clicking a slot selects it and updates the focus panel with name, count, and description.
- Empty selection shows a placeholder state.
- Layout matches the existing UI style and spacing rules.

# Open questions
- None for v1.

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
