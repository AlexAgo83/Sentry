## item_016_mobile_bottom_action_bar - App bars (desktop top + mobile top/bottom)
> From version: 0.8.4
> Understanding: 96%
> Confidence: 92%
> Progress: 95%

# Context
The app has 3 “global” entry points users reach frequently:
- Primary navigation between main panels (`SidePanelSwitcher`: Action / Stats / Bank / Equip).
- Global controls (`Setup`, `Dev`).
- App identity / title.

The goal is to make these controls consistent, easy to reach, and predictable across desktop and mobile.

# Goal
Introduce proper app bars:
- Desktop: a top action bar containing **Title + SidePanelSwitcher + Setup + Dev**.
- Mobile: a top action bar containing **Title + Setup + Dev**, plus a bottom action bar containing **SidePanelSwitcher**.

# Needs
- Create a coherent “Top Action Bar” layout for desktop and mobile.
- On mobile, keep the main panel navigation (`SidePanelSwitcher`) in a bottom bar (ergonomic reach).
- Keep the current tablist semantics (`tablist`/`tab`) and focus styles.
- Ensure it plays well with modals (no overlap / no blocked controls).
- Respect iOS safe area insets and avoid layout jumps.
- Avoid duplicating the same navigation in multiple places at the same time.

# Decisions
- Selected option: **B1** (fixed bars + subtle slide/fade, hidden on modals).
- Prefer a single source of truth:
  - Desktop: `SidePanelSwitcher` renders in the top bar.
  - Mobile: `SidePanelSwitcher` renders in the bottom bar.
- Layout:
  - Desktop top bar: title on the left, `SidePanelSwitcher` centered, `Setup` + `Dev` on the right.
  - Mobile top bar: title on the left, `Setup` + `Dev` on the right.
- Positioning:
  - Desktop top bar: fixed.
  - Mobile top bar: fixed.
  - Mobile bottom bar: fixed + safe-area padding.
- Breakpoints:
  - Mobile layout: `max-width: 720px`.
- Visual style:
  - Use a “glass” (blurred) background for both top and bottom bars.
- Transitions (Option B):
  - When bars show/hide (especially when a modal opens/closes), animate with a short slide + fade.
  - Respect `prefers-reduced-motion` (disable animations).
- Responsive behavior:
  - If space is tight (medium widths), switch the `SidePanelSwitcher` tabs to icons with tooltips (keep semantics).
  - On mobile, use icons + short labels.
- Modal interaction:
  - Hide the top/bottom bars while any modal is open to avoid overlap and reduce distraction.
- Safe areas:
  - Use `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` where applicable.

# Scope (v1)
- Only move existing controls; no new tabs.
- No redesign of panel content.
- No new feature work behind Shop/Bank semantics beyond labels/layout.

# Acceptance
- Desktop: a single top action bar shows Title + SidePanelSwitcher + Setup + Dev.
- Mobile: top action bar shows Title + Setup + Dev; bottom bar shows SidePanelSwitcher.
- On mobile, the bottom navigation remains accessible while scrolling.
- Active tab state is clearly visible, and tab switching works as before.
- Top and bottom bars do not overlap important UI elements (especially action buttons and modals).
- When a modal is open, app bars are hidden (top and bottom).
- Bar show/hide has a subtle slide/fade transition (disabled for reduced-motion users).

# Open questions
- Should the mobile bottom bar be always visible or auto-hide on scroll?
- Which overlays count as “modal open” for hiding bars (all modals vs only some)?
