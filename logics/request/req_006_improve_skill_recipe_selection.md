## req_006_improve_skill_recipe_selection - Action Selection screen — improve skill & recipe selection UI (desktop + mobile)
> From version: 0.8.9
> Understanding: 80%
> Confidence: 70%

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
  - Right (or bottom): action summary (duration, XP, consumes/produces, missing items).
- Mobile:
  - Top: Skill picker as horizontally scrollable chips/cards.
  - Below: recipe list as tappable cards with clear locked styling.
  - Keep Start/Interrupt/Back accessible without covering content.

# Related
- Previous request: `logics/request/req_005_action_selection_screen.md`.
