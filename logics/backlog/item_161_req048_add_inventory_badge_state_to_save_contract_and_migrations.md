## item_161_req048_add_inventory_badge_state_to_save_contract_and_migrations - Persist inventory NEW badge state inside the save contract (schema + migrations)
> From version: 0.9.31
> Understanding: 95%
> Confidence: 88%
> Progress: 0%
> Complexity: Medium
> Theme: Persistence / UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Inventory "NEW item" badges are currently local-only (stored in `localStorage`), so they do not survive export/import or cloud sync and can diverge across devices.

# Scope
- In:
- Extend the persisted save schema to include inventory badge state:
  - `seenItemIds: Record<ItemId, true>`
  - `seenMenuIds: Record<ItemId, true>`
  - Prefer nesting under a UI namespace (ex: `ui.inventoryBadges`) to avoid polluting gameplay root.
- Update core types to reflect the new persisted field(s).
- Ensure serialization/hydration includes the new field.
- Add save migration/normalization so missing/invalid badge state is handled safely.
- Define deterministic defaults for new saves and upgraded saves (no flood of NEW badges).
- Out:
- No UI wiring changes (handled in a separate item).

# Acceptance criteria
- Save payload includes inventory badge state and round-trips correctly (serialize -> hydrate).
- Missing/invalid badge fields are normalized to a safe default.
- Upgrading an existing save does not turn the whole inventory into NEW.

# Implementation notes
- Likely touch points:
  - `src/core/types.ts`
  - `src/core/serialization.ts`
  - `src/core/state.ts` (hydrate + initial state defaults)
  - `src/adapters/persistence/saveMigrations.ts`

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_048_persist_inventory_new_item_badges_in_save.md`.

