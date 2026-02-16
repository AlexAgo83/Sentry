## req_053_accessibility_compliance_hardening_for_dialogs_tabs_and_keyboard_flows - Accessibility compliance hardening for dialogs tabs and keyboard flows
> From version: 0.9.36
> Understanding: 96%
> Confidence: 90%
> Complexity: Medium
> Theme: Accessibility / UX quality
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Resolve accessibility gaps identified in the latest UI accessibility review.
- Improve keyboard and screen-reader reliability on navigation-heavy and modal-heavy flows.
- Establish stronger a11y regression protection in CI.

# Context
- The app already includes many accessibility basics (`aria-label`, semantic buttons, tooltip labels), but several structural issues remain:
  - missing page language metadata (`lang` on `<html>`),
  - dialogs without robust accessible naming and focus management,
  - mobile roster drawer using dialog semantics without full modal behavior,
  - tab widgets using partial ARIA patterns,
  - one custom interactive text element implemented as `role="button"` on a non-button tag.
- Current automated a11y test coverage is narrow and currently focuses on a single panel.
- Constraints:
  - preserve current visual UX and game flow behavior,
  - avoid heavy architectural rewrites,
  - prioritize low-risk progressive hardening with clear test coverage.

# Goals
- Accessibility semantics
  - add required document metadata and complete dialog semantics.
  - standardize interactive controls on native elements where possible.
- Keyboard support
  - ensure modal/dialog focus behavior is predictable.
  - align tab navigation with ARIA authoring guidance.
- Test quality
  - expand accessibility tests to cover critical screens and states.

# Non-goals
- Full visual redesign.
- Full WCAG AAA effort.
- Complete rewrite of all legacy components in one pass.

# Scope detail (draft)
## A. Document-level accessibility metadata
- Add `<html lang=\"...\">` to the main document and validate language choice.

## B. Dialog and modal interaction hardening
- Improve modal shell accessibility:
  - explicit accessible name linkage (`aria-labelledby` or `aria-label`),
  - initial focus placement when opening,
  - focus trap while open,
  - focus restoration on close.
- Apply the same principles to startup splash and mobile roster drawer where dialog semantics are used.

## C. Tabs semantics and keyboard interaction consistency
- Audit tablists and tabs used by:
  - top panel switchers,
  - inventory sort tabs,
  - stats tabs.
- Add/standardize:
  - proper tab-to-panel relationships,
  - predictable arrow-key navigation behavior,
  - consistent selected-state announcements.

## D. Replace custom non-native interactive elements
- Replace `role=\"button\"` usage on non-button text nodes with semantic `<button>` where feasible.
- Keep visual style unchanged while improving assistive behavior.

## E. Accessibility regression coverage expansion
- Extend automated accessibility tests to include:
  - modal shell,
  - startup splash dialog,
  - side panel switcher/tabs,
  - dungeon replay log interaction.
- Keep current test battery green and make new checks part of regular CI runs.

# Technical references likely impacted
- `index.html`
- `src/app/components/ModalShell.tsx`
- `src/app/components/StartupSplashScreen.tsx`
- `src/app/AppView.tsx`
- `src/app/components/SidePanelSwitcher.tsx`
- `src/app/components/InventoryControls.tsx`
- `src/app/components/StatsDashboardPanel.tsx`
- `src/app/components/dungeonScreen/components/DungeonReplayView.tsx`
- `tests/app/accessibility.test.tsx`
- `tests/app/modalShell.test.tsx`

# Acceptance criteria
- HTML root includes a valid `lang` attribute.
- Dialogs used in primary flows have explicit accessible naming and robust keyboard focus behavior.
- Mobile roster drawer behavior is accessible and consistent with dialog semantics.
- Tab widgets expose complete and consistent keyboard/screen-reader behavior.
- Non-native interactive text/button patterns are removed or justified with equivalent semantics.
- Accessibility test coverage is expanded and passing in CI.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Recommended:
  - targeted checks for modal/tab keyboard behavior via Testing Library
  - `npm run build`
  - `npm run test:e2e` (smoke verification)

# Backlog
- `logics/backlog/item_172_req053_modal_and_dialog_accessibility_contract_hardening.md`
- `logics/backlog/item_173_req053_tabs_aria_semantics_and_keyboard_consistency.md`
- `logics/backlog/item_174_req053_dungeon_replay_log_semantic_control_cleanup.md`
- `logics/backlog/item_175_req053_expanded_accessibility_regression_test_suite.md`
