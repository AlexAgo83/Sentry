## item_173_req053_tabs_aria_semantics_and_keyboard_consistency - req053 tabs aria semantics and keyboard consistency
> From version: 0.9.36
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Accessibility / Navigation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Several tab-like controls currently expose partial ARIA semantics (`tablist`/`tab`) but do not fully implement expected relationships and keyboard interaction patterns. This can create inconsistent behavior for keyboard users and assistive technologies.

# Scope
- In:
- Audit and standardize tab controls in:
  - side panel switcher,
  - inventory sort controls,
  - stats panel tabs.
- Ensure robust ARIA relationships and selected-state communication.
- Implement consistent keyboard behavior (including arrow-key navigation where relevant).
- Preserve existing visual design and click/touch behavior.
- Out:
- Modal/dialog accessibility concerns (covered by item_172).
- Replay log semantic cleanup (covered by item_174).

# Acceptance criteria
- All tab widgets in scoped components expose complete, consistent ARIA semantics.
- Keyboard navigation across tabs is predictable and documented in tests.
- No regression in existing navigation flows on desktop and mobile.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_053_accessibility_compliance_hardening_for_dialogs_tabs_and_keyboard_flows.md`.
- Likely touch points:
  - `src/app/components/SidePanelSwitcher.tsx`
  - `src/app/components/InventoryControls.tsx`
  - `src/app/components/StatsDashboardPanel.tsx`

# Delivery
- Standardized keyboard navigation on all scoped tab widgets:
  - `src/app/components/SidePanelSwitcher.tsx` now supports `ArrowLeft`/`ArrowRight`/`Home`/`End`.
  - `src/app/components/InventoryControls.tsx` now supports horizontal arrow navigation and roving `tabIndex`.
  - `src/app/components/StatsDashboardPanel.tsx` now supports horizontal arrow navigation and roving `tabIndex`.
- Reinforced tab semantics:
  - added explicit `aria-controls` linkage for side panel tabs toward `app-main-view`,
  - linked stats tabs to a real `tabpanel` (`aria-controls` / `aria-labelledby`).
- Added regression assertions for keyboard tab navigation in:
  - `tests/app/sidePanelSwitcher.dungeonActive.test.tsx`
  - `tests/app/inventoryControls.test.tsx`
  - `tests/app/statsDashboardPanel.test.tsx`
