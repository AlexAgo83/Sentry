## req_006_improve_skill_recipe_selection - Action Selection screen — improve skill & recipe selection UI (desktop + mobile)
> From version: 0.8.9
> Understanding: 90%
> Confidence: 90%

# Needs
- The Action Selection screen should offer a more visual, scannable way to pick:
  - a skill (action),
  - a recipe (for that skill).
- Improve clarity of the current selection:
  - show skill/recipe level at a glance,
  - show locked recipes (with unlock level) in a clear way,
  - keep the “missing items” hint visible and readable.
- Provide a responsive layout that feels good on:
  - desktop (wide, two-pane / three-pane layout),
  - mobile (single-column, touch-first, no cramped dropdowns).
- Keep behavior equivalent to the current implementation (no gameplay changes):
  - same defaulting rules (previous recipe if still unlocked, else first unlocked),
  - same Start/Interrupt/Back actions,
  - same unlock rules and validations.

# Context
- The Action Selection screen was introduced by `req_005_action_selection_screen` (replacing the Loadout modal).
- Current UI uses two basic `<select>` dropdowns (`Select skill`, `Select recipe`), which is:
  - hard to scan quickly on desktop,
  - visually heavy on mobile and does not leverage the available screen space.

# Constraints / decisions
- Must remain a dedicated screen (not a modal).
- Must remain reachable only via the **Change** button (not main tab navigation).
- Mobile breakpoint remains `max-width: 720px`.
- Accessibility: keep full keyboard navigation and readable focus states.

# UX direction (proposal)
- Desktop:
  - Left: Skill picker as a vertical list of “skill cards” (icon + name + level).
  - Middle: Recipe picker as a list/grid of “recipe cards” (name + recipe level + lock/unlock).
  - Below: action summary panel (duration, XP, consumes/produces, missing items).
- Mobile:
  - Top: Skill picker as a vertical list (touch-friendly cards).
  - Below: recipe list as tappable cards with clear locked styling.
  - Keep Start/Interrupt/Back accessible without covering content.

# Decisions (v1 defaults)
- Pickers:
  - Skills: visual “card list” on desktop and mobile (no `<select>` as primary UX).
  - Recipes: responsive grid on desktop, single-column list on mobile.
- Locked recipes:
  - Shown by default (disabled) with an “Unlocks at Lv X” label.
  - No “Show locked” toggle in v1.
- Ordering:
  - Keep definition order (stable), with a visual separation between unlocked vs locked recipes if needed.
- Filters/search:
  - No search or filters in v1 (consider “Unlocked only” / “Craftable now” later if needed).
- Card density:
  - Cards show the minimum needed to decide: name + level (+ unlock level when locked).
  - Recipes also show a lightweight “Consumes / Produces” preview on each recipe card.
- Accessibility:
  - Use semantic, focusable controls for selection (radio-like behavior).
  - Keyboard: Tab to move between sections, Enter/Space to select; visible focus states.

# Acceptance (for implementation)
- Skill and recipe selection are not primarily driven by `<select>` dropdowns.
- Desktop layout shows skills and recipes together (no excessive scrolling for basic browsing).
- Mobile layout is touch-friendly at `max-width: 720px` (comfortable tap targets, readable labels).
- Locked recipes are clearly indicated, show unlock level, and cannot be selected.
- Existing behavior remains equivalent:
  - When switching skills: keep previous recipe if still unlocked, else select the first unlocked recipe.
  - Start/Interrupt/Back behave as before; `Escape` still triggers Back.
  - “Missing items” hint remains visible and readable for unstartable selections.

# Related
- Previous request: `logics/request/req_005_action_selection_screen.md`.

# Execution
- Promoted to `logics/backlog/item_018_action_selection_improve_skill_recipe_selection_ui.md`.
- Planned in `logics/tasks/task_020_req_006_action_selection_skill_recipe_pickers.md`.

# Backlog
- `logics/backlog/item_018_action_selection_improve_skill_recipe_selection_ui.md`
