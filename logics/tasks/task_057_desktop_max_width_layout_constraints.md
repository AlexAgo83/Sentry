## task_057_desktop_max_width_layout_constraints - Desktop max-width layout + centered header
> From version: 0.9.6
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_071_desktop_max_width_layout_constraints.md`.

This task introduces a desktop max-width layout constraint (1200px) and aligns the header with the same constraint + rounded corners on large screens.

# Decisions (v1)
- Use a shared layout token (e.g. `--app-max-width: 1200px`) for layout + header.
- Apply the constraint only when viewport width exceeds 1200px.
- Constrain the header via an inner container that owns background, border, and radius.
- Keep backgrounds full-bleed and modals full-bleed.
- Reuse `--border-radius-harmonized` for constrained header corners.

# Suggestions (v1 defaults)
- Add a `--app-max-width` CSS variable in `styles/global.css` for reuse.
- Wrap the topbar content with an inner container (e.g. `.app-topbar-inner` becomes constrained, outer stays full-width).
- Apply `max-width + margin: 0 auto` to the main layout container when viewport > 1200px.
- Avoid double-padding by relying on the existing `--app-shell-pad-x` gutter.

# Open questions to confirm
- Should the topbar corners be rounded on all corners or only bottom corners?
- Do we need a subtle border/outline on the constrained header to emphasize the edges?

# Plan
- [ ] 1. Add layout max-width token and desktop constraint:
  - Define `--app-max-width` in `styles/global.css`.
  - Apply `max-width` + centered margins for the desktop layout container.
- [ ] 2. Constrain header layout:
  - Add an inner wrapper that owns background/border/radius.
  - Ensure header stays aligned with the constrained layout when > 1200px.
- [ ] 3. Preserve responsive behavior:
  - Verify no regression at <= 1200px widths.
  - Confirm mobile bottom bar + safe-area insets are unchanged.
- [ ] 4. Add a small visual regression check note:
  - Capture screenshots at 1200px, 1440px, 1920px for validation.
- [ ] FINAL: Update related Logics docs

# Validation
- Visual check at 1200px / 1440px / 1920px widths.
- Optional: `npm run test:ci`

