## item_146_add_titles_and_aria_labels_across_all_clickable_controls - Add titles and aria-labels across all clickable controls
> From version: 0.9.30
> Understanding: 92%
> Confidence: 88%
> Progress: 0%
> Complexity: High
> Theme: UX / Accessibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Many click targets (especially icon-only buttons) do not expose a hover description, making the UI harder to learn and reducing accessibility.

# Scope
- In:
- Sweep the app and ensure every clickable control has a non-empty `title`.
- Ensure icon-only clickables also have a non-empty `aria-label`.
- Prioritize key surfaces:
  - Settings modal and nested modals (save, graphics, telemetry, journal, reports, leaderboard, change).
  - Dungeon screen controls (start/stop, auto toggles, replay speed, etc.).
  - Panel icon actions (collapse/expand/edit/rename/etc.).
- Ensure disabled controls explain why they are disabled when meaningful (via `title`).
- Out:
- No change to control layout/visual design beyond tooltip strings.

# Acceptance criteria
- All clickable controls in the covered surfaces expose a hover description via `title`.
- All icon-only clickable controls expose `aria-label` (matching `title`).
- No regressions in existing navigation flows.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_045_tooltips_for_all_clickable_controls.md`.
