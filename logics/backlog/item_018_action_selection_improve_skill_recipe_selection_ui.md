## item_018_action_selection_improve_skill_recipe_selection_ui - Action Selection — Improve skill & recipe selection UI
> From version: 0.8.9
> Understanding: 90%
> Confidence: 90%
> Progress: 100%

# Context
The Action Selection screen is the place where players choose:
- a skill (action),
- a recipe (within that skill),
then start/interrupt the current action.

Current UX uses two basic `<select>` dropdowns for skill and recipe selection, which is:
- slow to scan on desktop (lots of hidden options),
- visually heavy on mobile (native selects + cramped layout),
- not leveraging the available screen space (skills + recipes can’t be compared at a glance).

Source request: `logics/request/req_006_improve_skill_recipe_selection.md`.

# Goal
Replace the dropdown-based selection UX with visual pickers that are faster to scan and more responsive, while keeping gameplay behavior equivalent.

# Needs
- Provide a visual skill picker (icon + name + level, clear selected state).
- Provide a visual recipe picker (name + recipe level, clear locked state + unlock level).
- Show a lightweight per-recipe preview of “Consumes / Produces” on recipe cards.
- Keep the action summary and “missing items” hint readable and easy to find.
- Support desktop and mobile layouts (mobile breakpoint `max-width: 720px`).
- Preserve selection rules and validations (no gameplay changes).

# Decisions (v1)
- Skills picker:
  - Desktop: vertical list of “skill cards”.
  - Mobile: vertical list of touch-friendly cards.
- Recipes picker:
  - Desktop: responsive grid.
  - Mobile: single-column list.
- Summary:
  - Desktop: summary panel below the pickers.
- Locked recipes:
  - Visible by default (disabled) with “Unlocks at Lv X”.
  - No “Show locked” toggle in v1.
- Ordering:
  - Keep definition order (stable).
  - Optionally separate unlocked vs locked visually (no functional filtering in v1).
- No search / filters in v1.
- Accessibility:
  - Selection uses semantic, focusable controls (radio-like behavior) with visible focus states.

# Scope (v1)
- In:
  - Update Action Selection UI to use visual pickers (no primary `<select>` UX).
  - Update styles for responsive desktop/mobile layouts.
  - Update/extend tests to cover the new UI while preserving behavior.
- Out:
  - Gameplay changes (unlock rules, XP, action timing).
  - Routing/deep links / browser back button behavior.
  - Recipe search, “craftable now” filter, or ingredient previews inside recipe cards.

# Acceptance
- Action Selection screen does not rely on dropdowns as the primary selection UX.
- Desktop: skills + recipes are visible together for browsing without excessive scrolling.
- Mobile (`<= 720px`): selection is touch-friendly and readable.
- Locked recipes are clearly indicated and cannot be selected.
- Selection behavior remains equivalent:
  - Switching skills keeps the previously selected recipe if still unlocked, else selects the first unlocked recipe.
  - Back/`Escape` behavior remains correct.
  - Missing-items hint is still shown for unstartable selections.

# Priority
- Impact: medium (high-frequency UI, improves usability across devices).
- Urgency: medium (post-action-selection-screen follow-up, good polish target).

# Notes
- Executed in: `logics/tasks/task_020_req_006_action_selection_skill_recipe_pickers.md`.

# Status
- Delivered (visual pickers for skills/recipes + responsive layout + tests updated).

# Problem
Describe the problem and user impact.

# Scope
- In:
- Out:

# Acceptance criteria
- Define acceptance criteria
