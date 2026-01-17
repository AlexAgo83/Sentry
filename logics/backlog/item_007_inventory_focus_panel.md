## item_007_inventory_focus_panel - Inventory focus panel + grid layout
> From version: 0.4.1
> Understanding: 96%
> Confidence: 92%
> Progress: 0%

# Context
The current inventory is a simple list. We need a more visual grid layout and a focused detail panel for the selected item.

# Goal
Upgrade the Inventory screen into a Minecraft-like grid and add a dedicated panel that shows details for the selected item.

# Needs
- Inventory items displayed as grid slots (square cells).
- A focus panel that updates when an item is selected.
- Focus panel shows item name, description placeholder, and current count.
- The focus panel lives within the Inventory view (same column/row layout as other panels).
- If no item is selected, show a neutral empty-state in the focus panel.

# Defaults (proposal)
- Grid renders only existing items (no empty slots) with fixed-size slots (64px), subtle borders, and hover highlights.
- Grid layout: 6 columns on desktop, 3 columns on mobile, 8px gap between slots.
- Slots use lightweight placeholder glyphs (e.g. monogram/letter) until real icons exist.
- Selected slot shows a 2px accent outline.
- Focus panel includes:
  - Title: item name (or "No item selected").
  - Count: current quantity.
  - Placeholder text: "No description yet."
  - "Clear" action to deselect (also allow clicking the selected slot to deselect).
- Empty state text: "Select an item to view details."
- Layout: focus panel to the right on desktop, below the grid on mobile (12px top margin).
- Data shape (v1): `items[]` with `{ id, name, count }`, `selectedItemId`.
- Skip keyboard navigation in v1.

# Scope (v1)
- Visual grid only; no drag/drop yet.
- No actual item descriptions beyond placeholder copy.
- Works on desktop and mobile (grid wraps).

# Acceptance
- Inventory panel renders items in a grid.
- Clicking a slot selects it and updates the focus panel.
- Empty selection shows a placeholder state.
- Layout matches the existing UI style and spacing rules.

# Open questions
- None for v1.
