## item_013_qa_feedback_sweep - UI adjustments from QA feedback
> From version: 0.7.2
> Understanding: 97%
> Confidence: 95%
> Progress: 100%

# Context
QA provided UI and UX feedback covering redundant controls, discoverability, copy clarity, and spacing issues.

# Goal
Address QA feedback with small UI adjustments while preserving current behavior.

# Needs
- Remove the Inventory button from the roster (redundant with the inventory tab).
- Use the version badge as the only System entry point (remove the System button), with clickable styling and a small gear icon.
- Move the "ACT" control into the Action panel header and rename to a descriptive action-change label (shipped label: "Change").
- Move the "SET" control into the Stats panel header and rename to a descriptive rename label (shipped label: "Rename").
- Format Offline recap "Time away" as `Xs` (<60s), `Xm Ys` (<1h), `Xh Ym` (>=1h, no seconds).
- Add 12px desktop spacing between "Sort" label and Name/Count buttons.
- Add 12px desktop spacing between "Search" label and the filter input.
- Remove the pagination row from the DOM when there is only one page.

# Decisions
- Keep the overall layout intact; only adjust placement and copy of existing controls.
- Keep the panel header action slot stable to avoid layout shifts when actions move.
- Prefer CSS spacing tweaks over layout rewrites.
- Use a compact duration formatter for Offline recap (seconds/minutes/hours).
- Add a subtle hover state and pointer cursor on the version badge; no tooltip.
- Style the version badge as a subtle button (light background + hover).
- Use a small inline SVG gear icon next to the version number (no new assets).
- Keep the version badge text as the version number only (no "System" label).
- Keep the moved controls as buttons with existing styling; only change labels.
- No System keyboard shortcut in v1 (clickable badge only).
- Keep the time-away formatter local to Offline recap.
- Place header actions on the right to align with existing controls.
- No roster copy changes required after removing the Inventory button.

# Scope (v1)
- No new features beyond the listed UI adjustments.
- No redesign of panels or typography.
- No mobile-specific redesign; only fix spacing where it is currently tight.

# Acceptance
- Roster no longer shows a redundant Inventory button.
- System access is available via the version badge (gear icon + hover) and is visually discoverable.
- Action panel header provides an explicit control to change action (shipped label: "Change") and Stats header provides an explicit control to rename the hero (shipped label: "Rename").
- Offline recap displays a readable time-away value for longer durations.
- Desktop spacing between sort/search labels and controls is improved (12px gap).
- Pagination controls are hidden when only one page exists.

# Open questions
- None for v1.

# Status
- Delivered in `logics/tasks/task_013_qa_feedback_sweep.md`.

# Problem
Describe the problem and user impact.

# Scope
- In:
- Out:

# Acceptance criteria
- Define acceptance criteria

# Priority
- Impact:
- Urgency:

# Notes
