## item_162_req048_wire_inventory_new_badges_to_persisted_state_and_remove_localstorage_source_of_truth - Make NEW badges derive from persisted save state (not localStorage)
> From version: 0.9.31
> Understanding: 92%
> Confidence: 86%
> Progress: 0%
> Complexity: Medium
> Theme: UX / State
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even if we add persisted badge fields, the UI will remain inconsistent until the inventory badge logic reads/writes that persisted state instead of `localStorage`.

# Scope
- In:
- Update inventory "NEW" logic so it is computed from:
  - `state.inventory.items` (ownership) and
  - persisted `ui.inventoryBadges.seenItemIds` / `seenMenuIds`.
- Update "mark seen" operations so they update game state (persisted), not `localStorage`.
- Maintain UX invariants:
  - opening inventory clears menu-level NEW state
  - clicking/viewing an item clears that item NEW badge
- Ensure persistence happens through the existing save/autosave mechanisms (local export/import and cloud).
- Out:
- No legacy import/compatibility path (handled in a separate item).

# Acceptance criteria
- NEW badges survive reload/relaunch because the source of truth is the save.
- Export/import and cloud sync carry badge state across devices.
- Menu-level and item-level seen behavior matches current UX semantics.

# Implementation notes
- Likely touch points:
  - `src/app/hooks/useInventoryNewBadges.ts`
  - whichever reducer/actions update game state for UI badge fields

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_048_persist_inventory_new_item_badges_in_save.md`.

