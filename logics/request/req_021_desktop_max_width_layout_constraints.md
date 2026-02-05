## req_021_desktop_max_width_layout_constraints - Desktop max-width layout + centered header
> From version: 0.9.6
> Understanding: 95%
> Confidence: 90%

# Needs
- Add a max-width constraint on desktop when viewport exceeds a threshold (target: 1200px).
- Center the whole page content within that max-width.
- Ensure the header follows the same constraint and shows rounded edges when constrained.

# Goals
- Improve readability on large screens by preventing overly wide layouts.
- Keep the visual system consistent: header aligns with page width and shares the same spatial rhythm.
- Preserve existing mobile/tablet behavior (no regressions).

# Locked decisions (v1)
- Apply the constraint only when the viewport exceeds 1200px.
- Center the constrained layout horizontally.
- Header must respect the same max-width and have rounded corners in constrained mode.
- Use a shared token (e.g. `--app-max-width: 1200px`) for layout + header.
- Keep backgrounds full-bleed; only the content container is constrained.
- Constrain the header via an inner container that owns background/border/radius.
- Keep modals/full-screen overlays full-bleed (no max-width constraint).
- Use existing `--border-radius-harmonized` for the constrained header bottom corners only.
- Set topbar icon-only threshold to `1100px` to keep labels readable on wider desktops.
- Throttle dungeon screen cursor updates to ~30fps to reduce console violations in dev.

# Scope detail (draft)
- Layout:
  - Introduce a layout max-width variable (e.g., `--app-max-width: 1200px`) and reuse it across shell + header.
  - Apply `max-width` + `margin: 0 auto` to the main layout container.
  - Keep the background/ambient gradients full-bleed (not cropped).
- Header:
  - Constrain the header container to the same max-width.
  - Add rounded corners to the bottom edge only, matching `--border-radius-harmonized`.
  - Ensure the fixed header still aligns with `app-topbar` offset logic and safe-area padding.
- Responsive:
  - Preserve current behavior on widths <= 1200px.
  - No changes to mobile bottom bar behavior.
  - Avoid double-padding when max-width is active (use existing shell padding as the outer gutter).
  - Move topbar icon-only breakpoint to `1100px` after adding the Dungeon button.
  - Reduce dungeon screen cursor update frequency (30fps cap) to limit dev console noise.

# Technical references to update
- `styles/global.css` (layout + topbar constraints)
- `src/app/AppView.tsx` (header/layout structure)
- `src/app/styles/responsive.css` (if breakpoints need override for constrained mode)

# Acceptance criteria
- On viewports > 1200px, the main content uses max-width 1200px and is centered.
- On viewports > 1200px, the header matches the same width and shows rounded bottom corners.
- On viewports <= 1200px, layout and header remain full-width as they are today.
- No regressions in mobile layout or safe-area spacing.
- Topbar labels collapse to icon-only at <= 1100px.
- Dungeon screen cursor updates are throttled (30fps) with no gameplay impact.

# Risks / open points
- Fixed header + centered layout may need an extra wrapper to avoid breaking current padding.

# Backlog
- `logics/backlog/item_071_desktop_max_width_layout_constraints.md`
