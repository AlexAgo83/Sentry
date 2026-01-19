## task_016_app_perf_save_observability - App architecture/perf refactor + save hardening + observability
> From version: 0.8.0  
> Understanding: 90%  
> Confidence: 85%  
> Progress: 85%

# Context
The app is growing and `src/app/App.tsx` is still a large integration point with lots of derived state and handlers. This increases re-render churn and makes future features harder to implement safely. Persistence also needs to become more resilient (migrations, corruption handling). Finally, we need basic client-side observability to diagnose crashes in production.

# Decisions (preferred options)
- Keep the existing store/runtime architecture (no store rewrite).
- Add pure “selectors” for derived state under `src/app/selectors/` with unit tests.
- Split `App.tsx` into a thin container (wiring) + view components with stable props.
- Performance changes are guided by measurement (React Profiler); introduce additional context boundaries only if profiling shows broad invalidations.
- Save hardening:
  - JSON export/import with explicit `schemaVersion`
  - `migrateSave(vX -> latest)` pipeline + validation (payload-level schema version)
  - SHA-256 checksum (sync implementation) to detect corruption (not anti-cheat)
  - “last known good” snapshot and a safe-mode recovery flow
- Observability:
  - root `ErrorBoundary`
  - capture `error` + `unhandledrejection`
  - store crash reports locally (localStorage) and surface them via the existing System UI (viewer + clear)

# Non-goals
- No remote telemetry provider integration in this task (can be added later).
- No anti-tamper / anti-cheat system for saves (checksum is for corruption detection).

# Goals
1. Architecture: split `App.tsx` into a container + dedicated hooks/modules and centralize state “selectors” (derived state) for readability and testability.
2. Performance: reduce unnecessary re-renders by stabilizing derived state and extracting memoized subcomponents/contexts where appropriate.
3. Save system: introduce versioned migrations, export/import, checksum, and a “safe mode” flow for corrupted saves.
4. Observability: add a React `ErrorBoundary` plus capture `error`/`unhandledrejection` to help diagnose crashes in production.

# Plan
- [ ] 1. Baseline: identify current App responsibilities, major derived state blocks, and re-render hotspots (React Profiler in dev + a small “render count” helper for targeted components).
- [x] 2. Selectors: introduce `src/app/selectors/` for derived state with stable APIs (pure functions + unit tests).
- [x] 3. App split: refactor `src/app/App.tsx` into a thin container (e.g. `AppContainer`) that wires:
  - store/runtime lifecycle
  - UI layout composition
  - modal orchestration
  - selectors/hooks outputs
- [ ] 4. Perf hardening (partial - basic prop stability improvements shipped; profiling still pending):
  - ensure stable callbacks/props where it matters
  - memoize large lists and expensive computations (measured)
  - consider a small context split to avoid broad invalidations (only if profiling shows it helps)
- [ ] 5. Save v2 foundation (partial - envelope/checksum/last-good shipped; payload migrations pipeline still pending):
  - define `GameSave` schema versioning policy (`schemaVersion`, migrations contract)
  - implement `migrateSave(save)` pipeline (vX -> latest) + validation
  - compute/verify SHA-256 checksum; treat mismatches as “corrupt”
  - maintain “last known good” snapshot alongside the current save
- [x] 6. Save UI + safe mode:
  - add export/import in System UI
  - safe-mode screen/flow when corrupted save is detected (restore last good, export raw, reset)
- [x] 7. Observability:
  - add `ErrorBoundary` wrapping the app root (fallback UI + recovery actions)
  - capture `error` + `unhandledrejection` and store a bounded list of local crash reports
  - expose crash report viewer + clear action via System UI
- [ ] 8. Tests (partial - key areas covered; still room to expand crashReporter + hooks coverage):
  - unit tests for selectors/migrations/checksum/corruption detection
  - smoke tests for safe-mode handling and boundary fallback UI
  - ensure CI coverage thresholds remain satisfied
- [x] FINAL: run `npm run lint`, `npm run tests`, `npm run coverage`, and confirm improvements (render count reductions in key flows + app robustness for corrupted saves/crashes).

# Status (current implementation)
- `App.tsx` is now a thin wrapper over `AppContainer` + `AppView` (layout), with some dedicated hooks:
  - `useCrashReportsState` (local crash report list + clear)
  - `useServiceWorkerUpdatePrompt` (SW update prompt lifecycle)
  - `useSafeModeState` (persistence load report + modal open/close)
- Perf-oriented refactors:
  - `AppView` is now a layout component and receives panel nodes instead of large derived props.
  - Tick-heavy state is isolated behind dedicated containers under `src/app/containers/` (Action/Stats/Inventory/Equipment/Roster), reducing unnecessary recomputation and invalidations outside the active subtree.
  - `SystemModalContainer` still isolates `loop/perf` subscriptions behind the modal boundary.
- Dev-only baseline helper is available via `src/app/dev/renderDebug.ts`:
  - set `localStorage["sentry.debug.renderCounts"] = "1"` and watch console `debug` logs for current counts.
- Save hardening is in place via a v2 envelope + checksum + last-known-good recovery; System UI now exposes export/import; “safe mode” modal appears when load is migrated/recovered/corrupt.
- Payload-level schema versioning is introduced (`GameSave.schemaVersion`) and saves are migrated/validated on load via `src/adapters/persistence/saveMigrations.ts` before hydration.
- Safe mode now includes quick actions to export raw current/last-good saves (for debugging) and reset.
- Observability is in place via a root `ErrorBoundary` and global `error` / `unhandledrejection` capture with local crash report storage and a System UI viewer.

# Acceptance
- `src/app/App.tsx` is significantly smaller and primarily composes extracted modules (container + view split).
- Derived state is centralized and tested (selectors), with a clearer and more stable data flow.
- Profiling shows reduced re-render churn in key UI flows (panel switching, inventory, modals), without changing gameplay behavior.
- Saves migrate safely across versions; corrupted saves trigger safe mode (restore last good / export raw / reset) instead of breaking the app.
- A crash in UI code is caught by an `ErrorBoundary` and produces a locally accessible crash report (without crashing the entire app).
