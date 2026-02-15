## item_145_define_tooltip_conventions_and_shared_helper - Define tooltip conventions and shared helper
> From version: 0.9.30
> Understanding: 93%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: UX / Accessibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Clickable controls are inconsistent in discoverability and accessibility. Without a convention, new UI elements will keep shipping without hover descriptions and `aria-label` coverage.

# Scope
- In:
- Define the v1 tooltip rule set:
  - all clickables must have a non-empty `title`.
  - icon-only clickables must also have a non-empty `aria-label` (matching the `title`).
- Decide how to apply it consistently:
  - either a tiny helper (`withTitleProps`) or a small wrapper component to reduce boilerplate.
- Document exceptions (if any) and ensure they are explicit and testable.
- Out:
- No custom tooltip renderer (native `title` only in v1).
- No i18n overhaul.

# Acceptance criteria
- There is a single, documented convention to add hover descriptions (`title`) and accessibility labels (`aria-label`).
- A shared helper/wrapper exists if it meaningfully reduces repeated code.
- At least one representative surface uses the convention as proof of pattern.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_045_tooltips_for_all_clickable_controls.md`.
