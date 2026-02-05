## task_057_desktop_max_width_layout_constraints - Desktop max-width layout + centered header
> From version: 0.9.6
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_071_desktop_max_width_layout_constraints.md`.

This task introduces a desktop max-width layout constraint (1200px) and aligns the header with the same constraint + rounded corners on large screens.

# Decisions (v1)
- Use a shared layout token (e.g. `--app-max-width: 1200px`) for layout + header.
- Apply the constraint only when viewport width exceeds 1200px.
- Constrain the header via an inner container that owns background, border, and radius.
- Keep backgrounds full-bleed and modals full-bleed.
- Reuse `--border-radius-harmonized` for constrained header bottom corners only.
- Move topbar icon-only breakpoint to `1100px`.

# Suggestions (v1 defaults)
- Add a `--app-max-width` CSS variable in `styles/global.css` for reuse.
- Wrap the topbar content with an inner container (e.g. `.app-topbar-inner` becomes constrained, outer stays full-width).
- Apply `max-width + margin: 0 auto` to the main layout container when viewport > 1200px.
- Avoid double-padding by relying on the existing `--app-shell-pad-x` gutter.

# Open questions to confirm
- Do we need a subtle border/outline on the constrained header to emphasize the edges?

# Plan
- [x] 1. Add layout max-width token and desktop constraint:
  - Define `--app-max-width` in `styles/global.css`.
  - Apply `max-width` + centered margins for the desktop layout container.
- [x] 2. Constrain header layout:
  - Add an inner wrapper that owns background/border/radius.
  - Ensure header stays aligned with the constrained layout when > 1200px.
- [x] 3. Preserve responsive behavior:
  - Verify no regression at <= 1200px widths.
  - Confirm mobile bottom bar + safe-area insets are unchanged.
- [x] 4. Add a small visual regression check note:
  - Capture screenshots at 1200px, 1440px, 1920px for validation.
- [x] FINAL: Update related Logics docs

# Validation
- Visual check at 1200px / 1440px / 1920px widths.
- Optional: `npm run test:ci`

# Report
- Added `--app-max-width` token and centered desktop layout when viewport >= 1200px.
- Introduced a constrained topbar surface with rounded corners that matches the layout width.
- Kept full-bleed backgrounds and preserved mobile/bottom bar behavior.
- Updated topbar label breakpoint to 1100px and limited header rounding to bottom corners only.
