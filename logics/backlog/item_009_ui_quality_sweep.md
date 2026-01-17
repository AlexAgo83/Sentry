## item_009_ui_quality_sweep - Accessibility + UI perf + inventory UX
> From version: 0.5.0
> Understanding: 96%
> Confidence: 92%
> Progress: 0%

# Context
UI/UX polish items are surfacing (accessibility, density, and data presentation) alongside some App-level performance churn.

# Goal
Improve UI accessibility, clarity, and performance hotspots without changing core gameplay.

# Needs
- Improve accessibility: focus-visible styles, tap target sizing, and labels for interactive inventory slots.
- Reduce UI perf churn: memoize derived maps in `App.tsx` and avoid repeated `ITEM_DEFINITIONS` scans per render.
- Refactor UI metadata into modules (skill icons, item usage, inventory meta) to keep `App.tsx` readable.
- Improve inventory UX with lightweight sorting/filtering and a clearer empty-state copy.
- Add UI tests that cover accessibility hooks and inventory usage labels.
- Optimize SVG usage (reuse sprite or icon components) to reduce DOM overhead.

# Defaults (proposal)
- Use a `:focus-visible` treatment consistent with current UI borders (2px accent outline).
- Minimum tap target size: 40px for buttons/slots.
- Inventory sorting: default = Name, with a single dropdown for "Name" and "Count" (only items with count > 0, no persistence in v1).
- Favor `useMemo` for static derived lists and move metadata to dedicated modules.

# Scope (v1)
- No redesign of the overall layout or visual language.
- Sorting/filtering is minimal (single dropdown: Name / Count).
- UI perf refactor limited to memoization and moving metadata modules.
- SVG optimization is limited to refactors (no asset redesign).

# Acceptance
- Interactive UI elements meet minimum tap target size (40px) and have visible focus state (outline + subtle glow).
- Inventory usage metadata is readable, and the inventory UI stays performant.
- Sorting works for Name/Count (items with count > 0 only) with no persistence in v1.
- UI tests cover focus-visible and inventory usage labels.
- SVG rendering is consolidated so repeated icons do not create excessive DOM nodes.

# Open questions
- None for v1.

# Test coverage
- Focus-visible styling present on interactive elements.
- Inventory focus panel shows usage labels ("Used by" / "Obtained by").
