## req_051_one_time_onboarding_modals_first_minutes_and_per_screen_guidance - Add one-time onboarding modals for first minutes and per-screen guidance
> From version: 0.9.31
> Understanding: 92%
> Confidence: 84%
> Complexity: High
> Theme: UX / Onboarding
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Improve onboarding with a **series of one-time modals** that guide the player:
  - during the first minutes after installing/starting the app (first actions),
  - and when entering key screens for the first time (per-screen one-shot tips).
- Onboarding must be **single-use** by default:
  - once a step is completed/dismissed, it should not appear again automatically.
- Players must be able to:
  - skip onboarding,
  - disable future prompts,
  - optionally reset onboarding (so they can re-see tips).

# Context
- The game has multiple screens/panels (actions, roster, inventory, dungeon preparation, etc.).
- New players may not discover important flows (selecting first action, recipes, where to find inventory/equipment, how dungeon prep works, cloud save benefits).
- The app already has a modal system and persistent save/migration pipeline.

# Goals
- Increase early retention by helping players reach “first fun” quickly:
  - create/select first hero,
  - start first actions,
  - understand inventory and equipment,
  - understand dungeon prep and first dungeon entry (when relevant).
- Make onboarding non-annoying:
  - no repeated popups once dismissed,
  - no prompts while the backend is offline/warming (if any onboarding step depends on cloud).
- Keep onboarding maintainable:
  - steps are declarative and versionable,
  - can add new steps in future versions without breaking existing saves.

# Non-goals
- A fully animated/tutorialized overlay system with spotlight positioning (v1 uses modal-based guidance).
- Translating all onboarding copy to multiple languages unless i18n infra exists.
- Telemetry/analytics pipeline for onboarding (optional later).

# Locked decisions (v1)
## One-time step registry
- Onboarding steps are keyed by stable IDs (string constants).
- Completion state is persisted:
  - Recommended: store in the save payload so it persists across relaunch/export/import/cloud sync.
  - A device-local fallback (localStorage) is acceptable only if save persistence is too invasive.
- Steps are versionable:
  - use a `schemaVersion` for onboarding state (or rely on save schema migrations) so new steps can be introduced safely.

## Player control
- Each onboarding modal must offer:
  - `Next` / `Got it` (depending on step type),
  - `Skip` (skip the remaining onboarding sequence),
  - `Don't show again` (disables future onboarding prompts globally),
  - Optional: `Remind me later` (dismisses and can reappear in the same session only if needed).
- Settings must expose:
  - toggle: onboarding enabled/disabled,
  - action: reset onboarding progress (re-enable all steps).

## Where it appears
- “First minutes” onboarding starts after initial app ready (post-hydration) and must not block core rendering.
- Per-screen tips should trigger:
  - on first navigation to that screen,
  - only if onboarding is enabled and the step has not already been completed.

# Suggested onboarding content (draft)
## First minutes sequence (example)
1. Welcome / goal: “Start your first action.”
2. Roster basics: select a hero and pick an action + recipe.
3. Inventory: “You’ll find new items here; equip gear to get stronger.”
4. Dungeon prep (only when dungeon is available/unlocked): party selection, auto restart/heal.
5. Cloud save (optional, only if backend online): benefits and where to log in.

## Per-screen one-shot tips (example)
- Action selection screen: recipe unlocks, costs vs rewards.
- Inventory/equipment: slots, compare stats, “obtained by”.
- Dungeon screen: what the bars mean, speed/replay controls (if present).
- Settings/system: where to find telemetry/reports/journal.

# Scope detail (draft)
## Data model
- Add a persisted onboarding state structure (name TBD):
  - `enabled: boolean`
  - `completedStepIds: Record<string, true>`
  - `skippedAt?: number` (optional)
  - `schemaVersion?: number` (optional)

## Orchestration
- Add an onboarding orchestrator that can:
  - compute the next step given current app state/screen,
  - open the correct modal,
  - mark steps completed,
  - handle skip/disable/reset.

## UI
- Add reusable onboarding modal component(s) consistent with existing system modal style.
- Ensure all onboarding controls have `title`/`aria-label` per tooltip conventions.

## Warmup/offline constraints
- Steps that require backend (e.g. cloud save suggestion) must only show if backend is confirmed online.
- Warmup/offline should never cause onboarding to loop/spam.

## Testing
- Add tests covering:
  - onboarding state persistence via save round-trip,
  - step triggers (first run vs subsequent runs),
  - skip/disable/reset behavior,
  - per-screen step triggers not firing repeatedly.

# Technical references to update (expected)
- `src/app/AppContainer.tsx` / modal orchestrator container
- `src/app/containers/AppModalsContainer.tsx`
- `src/core/types.ts` / `src/core/state.ts` / `src/core/serialization.ts`
- `src/adapters/persistence/saveMigrations.ts`
- `src/app/components/SystemModal.tsx` (settings toggle/reset)
- `tests/app/*`
- `tests/core/serialization.test.ts`
- `tests/adapters/persistence/saveMigrations.test.ts`

# Acceptance criteria
- First run shows a guided onboarding sequence to reach first actions quickly.
- Entering key screens triggers a one-shot tip modal the first time only.
- Onboarding can be skipped, disabled, and reset from settings.
- Onboarding completion state persists through relaunch and save transfers.
- Tests prevent regressions on one-shot behavior and persistence.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Recommended:
  - `npm run coverage:ci`
  - `npm run build`

# Risks / open points
- Persisting onboarding state in cloud-synced saves means onboarding completion syncs across devices (usually desired).
- Adding many steps can annoy players; keep v1 small and high-impact.
- Modal overload: ensure onboarding does not interrupt critical gameplay moments.

# Backlog
- Backlog items should be generated next (state model + migrations, orchestrator, modal UI, settings controls, tests).

