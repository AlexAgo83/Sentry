## req_048_persist_inventory_new_item_badges_in_save - Persist inventory "NEW item" badge state inside the save (not local-only)
> From version: 0.9.31
> Understanding: 95%
> Confidence: 88%
> Complexity: Medium
> Theme: UX / Persistence
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Persist the inventory "NEW item" badge state in the game save so it survives:
  - app reload / relaunch,
  - local export/import,
  - cloud save sync (multi-device).
- Remove reliance on local-only storage as the source of truth.

# Context
- Today the "NEW item" badge state is managed by `useInventoryNewBadges` and stored in `localStorage` (global key + legacy per-version keys).
- Because this is local-only, the state does not travel with the save payload (cloud/export/import).

# Goals
- Make "NEW item" badges consistent with the save payload (single source of truth).
- Keep current UX semantics:
  - an item is "NEW" if inventory has `count > 0` and it has not been marked seen.
  - opening the inventory menu clears the menu-level badge (mark all menu-seen).
  - viewing/clicking an item clears that item badge (mark item-seen).
- Preserve a smooth upgrade path so existing players don’t suddenly see everything as NEW after updating.

# Non-goals
- Persisting other UI-only preferences into the save (panel tabs, collapse states, filters, etc.).
- Redesigning the inventory UI or badge UX.

# Locked decisions (v1)
- The canonical source of truth becomes the persisted save payload.
- Persist two seen sets:
  - `seenItemIds` (per-item badge)
  - `seenMenuIds` (inventory menu badge)
- Storage format in save is JSON-serializable and stable:
  - recommended: `Record<ItemId, true>` objects (not `Set`) for O(1) checks and deterministic serialization.

# Scope detail (draft)
## Save contract changes
- Add a new optional persisted field (name TBD, but must be clearly "UI badge state"):
  - Option A (recommended): `ui: { inventoryBadges: { seenItemIds: Record<ItemId,true>; seenMenuIds: Record<ItemId,true> } }`
  - Option B: `inventoryBadges: { ... }` at top-level (avoid if it pollutes gameplay root)
- Include this field in:
  - `toGameSave` serialization
  - hydration (`hydrateGameState`)
  - migration/normalization (`saveMigrations`)

## Runtime/state wiring
- Move "NEW item" state out of `localStorage`-only hook logic:
  - the app should compute NEW items from `state.inventory.items` + persisted seen sets
  - marking seen should update game state (so it persists through autosave/cloud)

## Upgrade/migration behavior (important)
- On first run after this change, if the save has no badge state yet:
  - preferred: seed it so that *currently owned items are considered seen* (same as current bootstrap behavior)
  - additionally (optional but recommended): if legacy `localStorage` badge state exists, import it once into the save to preserve user history
  - after importing legacy, write the new persisted state and stop relying on localStorage as the source of truth

## Tests
- Update/add tests to cover:
  - serialization round-trip includes inventory badge state
  - migration/normalization handles missing/invalid fields safely
  - legacy localStorage import path (if implemented)
  - UX invariants:
    - baseline seeding prevents “everything is NEW” after update
    - mark item seen / mark menu seen persists into save

# Technical references to update (expected)
- `src/app/hooks/useInventoryNewBadges.ts`
- `src/app/AppContainer.tsx`
- `src/core/types.ts` (save/state types)
- `src/core/serialization.ts`
- `src/core/state.ts` (hydrate + initial state)
- `src/adapters/persistence/saveMigrations.ts`
- `tests/app/hooks/useInventoryNewBadges.test.tsx`
- `tests/core/serialization.test.ts`
- `tests/adapters/persistence/saveMigrations.test.ts`

# Acceptance criteria
- "NEW item" badge state persists via game save:
  - survives app relaunch,
  - is included in local export/import,
  - is included in cloud save payload.
- Upgrade does not cause a flood of NEW badges for existing inventories.
- Automated tests cover the persistence/migration behavior and core badge invariants.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Recommended (since persistence touches core flows):
  - `npm run coverage:ci`
  - `npm run build`

# Risks / open points
- If we keep legacy localStorage import, we must avoid creating divergent sources of truth:
  - legacy should be read once for migration only, then ignored.
- If cloud save is used across devices, “seen” state will sync too; confirm this is desired UX (default assumption: yes).

# Backlog
- Backlog items should be generated next (schema/state plumbing, migrations, tests, cleanup of legacy localStorage reliance).

