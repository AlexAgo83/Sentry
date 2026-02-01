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
11. Added runtime performance indicators to the System panel in `src/app/App.tsx`.
12. Moved Loadout into a modal opened from the roster in `src/app/App.tsx`.
13. Updated roster rows with compact action/select buttons and removed HP/stamina display in `src/app/App.tsx`.
14. Added recruit modal, stun progress styling, and stamina progress bar in `src/app/App.tsx` and `src/app/styles/app.css`.
15. Added skill and recipe XP progress bars in `src/app/App.tsx` and `src/app/styles/app.css`.
16. Removed textual skill/recipe XP stats in favor of progress-only display in `src/app/App.tsx`.
17. Added skill/recipe level indicators inside the XP progress labels in `src/app/App.tsx`.
18. Added offline recap modal on return (>=5s) with gains summary in `src/core/runtime.ts` and `src/app/App.tsx`.
19. Added reset save button to System panel in `src/app/App.tsx` and reset handler in `src/core/runtime.ts`.
20. Expanded offline recap to multi-player summaries and added startup catch-up logic in `src/core/runtime.ts` and `src/app/App.tsx`.
21. Added roster/system collapse toggles, rename modal (SET), clickable roster rows, themed progress overrides, and a skill icon card in `src/app/App.tsx` and `src/app/styles/app.css`.
22. Refined progress theming (light-blue stamina, apple-green skill/recipe) and ensured offline recap always includes all players in `src/app/styles/app.css` and `src/core/runtime.ts`.
23. Prevented the loop from running when the document is hidden on startup so offline recap can appear after prerender, in `src/core/runtime.ts`.

## Review (updated)
High
- None.

Medium
- ESM import in `src/dataObjects/items/itemStack.js` omits the `.js` extension; native ESM can fail to resolve it.
- Service worker uses a single static cache name and caches every GET request, which can serve stale assets after deploys and allow unbounded cache growth.

Low
- No tests cover the offline recap or reset flow.

Decisions / direction
- Offline recap: change to multi-player summary (aggregate per player, or summary + per-player rows).
- Service worker: prefer versioned caches (include app version in cache name), cache only core assets + built JS/CSS, and clear old caches on activate. Optionally implement stale-while-revalidate for navigation and asset requests.

# Validation
- npm run tests
- npm run lint

# Notes
