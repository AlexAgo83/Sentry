## task_006_test_coverage - Achieve full app test coverage
> From version: 0.4.0
> Understanding: 90%
> Confidence: 75%
> Progress: 0%

# Context
The app does not have comprehensive test coverage. We need full app coverage, including UI, store, core runtime, adapters, and data definitions.

# Goal
Create and execute a test plan that covers the full application surface, with stable CI-friendly coverage runs.

# Plan
- [ ] 1. Audit current coverage and map gaps (UI, store, runtime, adapters, entry points).
- [ ] 2. Add UI test tooling (jsdom + React Testing Library) and basic render tests.
- [ ] 3. Expand core/runtime tests for offline, visibility, and action flows.
- [ ] 4. Add store and adapter tests (gameStore, localStorageAdapter, persistence paths).
- [ ] 5. Migrate legacy JS tests to TypeScript where practical.
- [ ] 6. Add explicit tests for `localStorageAdapter.ts`.
- [ ] 7. Extend service worker tests in `sw.js` for the remaining branches.
- [ ] 8. Add UI interaction tests for loadout, inventory, and offline recap.
- [ ] 9. Set coverage thresholds and update documentation.
- [ ] FINAL: Run coverage and verify thresholds pass.

# Acceptance
- Coverage runs cleanly with `npm run coverage`.
- UI, store, core runtime, adapters, and entry points have tests.
- Coverage thresholds are defined and passing.
