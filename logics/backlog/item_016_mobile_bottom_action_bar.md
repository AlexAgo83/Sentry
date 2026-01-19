## item_016_mobile_bottom_action_bar - Mobile bottom action bar for SidePanelSwitcher
> From version: 0.8.2
> Understanding: 70%
> Confidence: 70%
> Progress: 0%

# Context
QA feedback suggests improving mobile usability by moving the main panel navigation (`SidePanelSwitcher`: Action / Stats / Bank / Equip) to a bottom action bar on small screens.

# Goal
Make the main panel navigation faster and more ergonomic on mobile, without changing desktop layout.

# Needs
- Render `SidePanelSwitcher` as a bottom bar on mobile breakpoints.
- Keep the current tablist semantics (keyboard + screen reader friendly).
- Ensure it plays well with modals (no overlap/blocked controls).
- Respect iOS safe area insets and avoid layout jumps.

# Decisions
- Desktop stays unchanged.
- Mobile uses a sticky/fixed bottom bar with the same 4 entries (icons optional).
- Prefer CSS-only layout changes unless component structure must change.

# Scope (v1)
- Only move the existing navigation; no new tabs.
- No redesign of panel content.

# Acceptance
- On mobile breakpoint, the navigation is displayed at the bottom and remains accessible while scrolling.
- On desktop breakpoint, the navigation remains at the top of the main column.
- Active tab state is clearly visible, and tab switching works as before.
- The bottom bar does not overlap important UI elements (especially action buttons and modals).

# Open questions
- What breakpoint(s) define “mobile” (e.g. `<= 768px`)?
- Should the bottom bar be always visible or auto-hide on scroll?
- Should labels be shortened further or replaced by icons on very small widths?
