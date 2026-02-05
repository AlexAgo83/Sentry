## item_071_desktop_max_width_layout_constraints - Desktop max-width layout + centered header
> From version: 0.9.6
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Problem
On large desktop screens the UI stretches too wide, which reduces readability and visual cohesion. The header also feels detached from the main layout because it remains full-bleed.

# Scope
- In:
  - Introduce a desktop max-width constraint (target 1200px) for the main layout.
  - Center the constrained layout when the viewport exceeds the threshold.
  - Constrain the header to the same max-width and add rounded corners in constrained mode.
  - Keep ambient backgrounds full-bleed.
  - Keep modals/overlays full-bleed (no max-width constraint).
- Out:
  - Redesign of mobile/tablet layouts.
  - Visual overhaul of panels or modal styling.

# Decisions (v1)
- Use a shared layout token (e.g. `--app-max-width: 1200px`) for layout + header.
- Apply the constraint only when viewport width exceeds 1200px.
- Use an inner header container that owns background, border, and radius.
- Reuse `--border-radius-harmonized` for constrained header bottom corners only.
- Move topbar icon-only breakpoint to `1100px`.

# Acceptance criteria
- On viewports > 1200px, the main content uses max-width 1200px and is centered.
- On viewports > 1200px, the header matches the same width and shows rounded bottom corners.
- On viewports <= 1200px, layout and header remain full-width as they are today.
- Mobile and safe-area behavior are unchanged.
- Topbar labels collapse to icon-only at <= 1100px.

# Priority
- Impact: Medium (UX polish + readability on desktop).
- Urgency: Medium.

# Notes
- Source request: `logics/request/req_021_desktop_max_width_layout_constraints.md`
- Derived from `logics/request/req_021_desktop_max_width_layout_constraints.md`.
- Task: `logics/tasks/task_057_desktop_max_width_layout_constraints.md`
