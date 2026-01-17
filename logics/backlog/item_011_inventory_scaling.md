## item_011_inventory_scaling - Inventory grid scaling + virtualization
> From version: 0.5.0
> Understanding: 94%
> Confidence: 90%
> Progress: 100%

# Context
Inventory rendering is currently static and will degrade if the item list grows significantly.

# Goal
Keep inventory performant and readable as item counts and types grow.

# Needs
- Add pagination for the inventory grid.
- Preserve selection behavior across pages/virtualized views.
- Keep the focus panel accurate and responsive.
- Provide an empty-state and a "no results" state if filtered.

# Decisions
- Use simple pagination (page size 36) before virtualization.
- Persist the current page in memory only (no save).
- Sort/filter before pagination.
- Show a "Page X/Y" indicator and total item count.
- If the selected item is on another page, show a hint in the focus panel.
- Keep keyboard navigation out of scope for v1.

# Scope (v1)
- No drag/drop or sorting persistence.
- No item categories required unless needed by pagination UI.

# Acceptance
- Inventory remains responsive with 200+ items.
- Selection remains stable when switching pages.
- Focus panel updates correctly.
- Selected item shows a hint when it is not on the current page.

# Open questions
- None for v1.
