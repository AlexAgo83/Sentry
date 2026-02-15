## req_045_tooltips_for_all_clickable_controls - Ensure every clickable control has a hover description
> From version: 0.9.29
> Understanding: 93%
> Confidence: 90%
> Complexity: Medium
> Theme: UX / Accessibility
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Any clickable control in the app must expose a short description on hover.
- Icon-only controls must also be accessible (screen readers) and discoverable.
- This must be testable to avoid regressions as UI grows.

# Context
- The UI contains many compact icon buttons (settings, toggles, action buttons, dungeon controls, replay controls, etc.).
- Some controls are self-explanatory visually, but many are not, especially for new players or when returning after a break.
- Tooltips are also a lightweight accessibility improvement when paired with `aria-label`.

# Goals
- Make every clickable control discoverable via hover text.
- Standardize how we add tooltips so we don’t reinvent patterns per component.
- Enforce the rule through automated tests.

# Non-goals
- A full redesign of controls or button labels.
- A rich tooltip system with images, multi-line content, positioning logic, etc. (v1 should be simple).
- Translating all tooltips to multiple locales if the app currently has no complete i18n infrastructure. (If i18n exists, tooltips must use it.)

# Locked decisions (v1)
- Minimal implementation uses the native `title` attribute:
  - It works everywhere (desktop browsers) and costs nothing to maintain.
  - It does not require a dedicated tooltip renderer.
- For icon-only controls:
  - Must include both `title` and `aria-label` (same string).
- For text buttons/links:
  - Must include `title` (can be identical to the visible label if no better description exists).
- For disabled controls:
  - If they are still present in UI, they must have a `title` explaining why they are disabled (when applicable).

# Scope detail (draft)
- Define “clickable control”
  - `button`
  - `a[href]`
  - any element with `role="button"` or `role="link"` and a click handler
  - (optionally) custom controls using `tabIndex=0` for clickability

- Implementation strategy
  - Add a tiny helper/wrapper to reduce boilerplate:
    - `withTitleProps({ title, ariaLabel? })` or a `Hint` component that renders children and injects `title`/`aria-label`.
  - Start by covering the “system surfaces”:
    - Settings modal + all nested modals (save, graphics, telemetry, journal, reports, leaderboard, change)
    - Main action controls (start/stop, dungeon, replay speed, etc.)
    - Any icon-only action on panels (collapse/expand/edit/etc.)
  - Ensure we don’t accidentally add tooltips to non-interactive decorative icons (`aria-hidden="true"`).

- Testing strategy
  - Add a reusable test helper that renders key app surfaces and asserts:
    - every `button` has a non-empty `title`
    - every `a[href]` has a non-empty `title`
    - icon-only controls have `aria-label` (non-empty)
  - At minimum, cover:
    - `App` smoke render
    - `SystemModal` navigation flows (settings -> nested modals)
    - `DungeonScreen` controls render

# Technical references to update (expected)
- `src/app/components/*` (buttons/controls throughout)
- `src/app/components/SystemModal.tsx`
- `src/app/containers/AppModalsContainer.tsx`
- `src/app/ui/*` (shared button components if any)
- `tests/app/*` (add/extend assertions)

# Acceptance criteria
- Hovering any clickable control shows a descriptive tooltip (native browser tooltip via `title`).
- No icon-only clickable control exists without an `aria-label`.
- Automated tests fail if a new clickable control is added without a `title` (and `aria-label` where required).
- No regression on existing modal navigation / gameplay flows.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - at least one UI test that enforces the “all clickables have title” invariant on major screens.

# Risks / open points
- Native `title` tooltips are not reliably shown on mobile (tap/long-press behavior differs). If mobile tooltip behavior is required, v2 should add a custom tooltip renderer.
- Some controls may already have a title used for other purposes; ensure we keep meaning consistent (avoid misleading tooltips).
- Disabled elements don’t always show tooltips depending on browser; if this becomes an issue, the wrapper may need to render a tooltip on a parent container.

# Backlog
- `logics/backlog/item_145_define_tooltip_conventions_and_shared_helper.md`
- `logics/backlog/item_146_add_titles_and_aria_labels_across_all_clickable_controls.md`
- `logics/backlog/item_147_add_regression_tests_for_tooltip_coverage.md`
