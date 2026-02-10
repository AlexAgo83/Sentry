## item_101_roster_drag_reorder_ui - Drag-and-drop roster reordering (desktop + mobile)
> From version: 0.9.12
> Understanding: 94%
> Confidence: 92%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Players cannot reorder the roster UI; the list is static and drag interactions must avoid accidental selection.

# Scope
- In:
- Implement roster drag-and-drop on desktop and mobile.
- Desktop: click-and-hold starts drag; drag cancels selection.
- Mobile: long-press to arm drag (500ms), drag threshold 8px.
- Prevent drag on nested interactive controls (buttons/menus).
- Visual lift/placeholder while dragging.
- Wire drag to reorder action and persist via `rosterOrder`.
- Out:
- No dedicated drag handle (v1).
- No changes to hero selection semantics beyond drag conflict rules.

# Decisions
- Drag threshold: 8px (desktop + mobile).
- Mobile long-press delay: 500ms.
- Card body is draggable; interactive sub-controls are excluded.
- Desktop: click-and-hold without drag still selects the hero.
- Mobile: long-press without drag is a no-op (no selection).

# Acceptance criteria
- Desktop: click-and-hold + drag reorders the roster list.
- Mobile: long-press is required before drag; normal tap selects.
- Dragging never starts from the add-hero card or header controls.
- Reorder is immediately reflected in the UI and persists after reload.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_036_roster_reorder.md`.
