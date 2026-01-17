## task_002_ts_rewrite_plan - Plan and bootstrap TS + React remake
> From version: 0.2.0
> Understanding: 92%
> Confidence: 88%
> Progress: 100%

# Context

This task executes `item_003_ts_rewrite`.

# Plan
- [x] 1. Define target architecture (domain core, UI layer, persistence adapter).
- [x] 2. Specify data model and types for entities, skills, recipes, actions, loop.
- [x] 3. Choose state management and project structure for React + TS.
- [x] 4. Bootstrap new app skeleton (Vite + React + TS).
- [x] 5. Implement core loop with offline/visibility handling.
- [x] 6. Implement persistence adapter (localStorage v1, interface for cloud later).
- [x] 7. Build initial UI shell + layout with modern fantasy design.
- [x] 8. Port gameplay features (skills, recipes, actions, progression).
- [x] 9. Add tests for core loop, persistence, and key flows.
- [x] 10. Add PWA configuration and verify offline behavior.

# Report
1. Defined the TS rewrite architecture, data model, and state management in `logics/architecture/ts_rewrite_blueprint.md`.
2. Added TS types for core entities and save schema in `src/core/types.ts`, plus definitions in `src/data/definitions.ts`.
3. Bootstrapped React + TS entry (`src/main.tsx`), app shell (`src/app/App.tsx`), and styling (`src/app/styles/app.css`).
4. Added TS tooling (`tsconfig.json`) and React Vite plugin setup in `vite.config.mjs`.
5. Implemented the TS core loop and offline catch-up in `src/core/loop.ts` and `src/core/runtime.ts`.
6. Added a localStorage persistence adapter in `src/adapters/persistence/localStorageAdapter.ts` with save serialization in `src/core/serialization.ts`.
7. Rebuilt the UI shell with roster, loadout, and action status panels in `src/app/App.tsx` and `src/app/styles/app.css`.
8. Wired skill/recipe/action selection to the core loop with multi-player support in `src/core/reducer.ts` and `src/core/state.ts`.
9. Added core loop and serialization tests in `tests/core/loop.test.ts` and `tests/core/serialization.test.ts`.
10. Added PWA manifest + service worker in `public/manifest.webmanifest` and `public/sw.js`, with registration in `src/main.tsx`.
5. Pending.
6. Pending.
7. Pending.
8. Pending.
9. Pending.
10. Pending.
