## task_017_perf_quality_tech_debt_sweep - Runtime offline catch-up + UI perf + lint + deps + TS test typecheck
> From version: 0.8.7  
> Understanding: 90%  
> Confidence: 90%  
> Progress: 100%

# Context
The project review highlighted a small set of technical risks that can compound over time:
- Runtime: offline catch-up is currently implemented as a per-tick loop (O(ticks)), which can freeze the UI after long absences (`src/core/runtime.ts` around the `runOfflineTicks` loop).
- UI performance: the store subscription hook (`useSyncExternalStore`) provides no selector equality, and some selectors allocate/sort on every call (e.g. player sorting).
- Lint: React Hooks rules are disabled globally, increasing the risk of stale dependencies and subtle bugs.
- Dependency hygiene: `glob` appears unused and `jest-axe` belongs in `devDependencies`.
- Type safety: `tsc` does not typecheck `tests/`, so test code can drift without type errors.

# Goals
1. Prevent long offline catch-ups from blocking the main thread (guard rails + scalable catch-up strategy).
2. Reduce avoidable re-render churn by improving store subscription patterns and selector stability.
3. Re-enable React Hooks linting with minimal friction (targeted fixes, not blanket disables).
4. Keep dependencies clean and correctly classified (runtime vs dev/test).
5. Add explicit TypeScript typechecking for `tests/` (and wire it into CI).

# Non-goals
- No gameplay/balance redesign (only correctness + performance guard rails).
- No store rewrite or new state-management library adoption.
- No “perfect” offline simulation for arbitrarily long gaps if it requires a major engine refactor; prefer pragmatic caps + clear UX messaging.

# Plan
- [x] 1. Baseline and constraints
  - Identify current timing parameters (`LOOP_INTERVAL`, `OFFLINE_INTERVAL`, `OFFLINE_THRESHOLD`).
  - Add/confirm tests that simulate long offline durations and assert runtime responsiveness (no timeouts).
- [x] 2. Runtime: offline catch-up scalability
  - Introduce a max offline catch-up cap and a larger-step catch-up loop to avoid O(ticks) overhead.
  - Surface “processed vs away” in the offline recap UI when the cap is hit.
  - Ensure offline summary remains correct for the processed window.
- [x] 3. UI perf: store subscription with selector equality
  - Extend `useGameStore` with selector equality (memoized snapshot) to avoid rerenders for equivalent selections.
  - Update hot paths (tick-heavy containers and frequently-rendered panels) to select minimal state slices.
- [x] 4. UI perf: selector allocations
  - Fix hook dependency warnings and stabilize memo inputs where practical.
- [x] 5. Lint: React Hooks rules
  - Re-enable `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps`.
  - Fix violations, and use targeted disables only where justified and documented in-code.
- [x] 6. Dependency hygiene
  - Remove `glob` if unused across `src/`, `tests/`, and `scripts/`.
  - Move `jest-axe` to `devDependencies` (test-only).
  - Run `npm audit` and ensure lockfile consistency.
- [x] 7. TypeScript: typecheck tests
  - Add `tsconfig.tests.json` (or similar) including `tests/`.
  - Add `npm run typecheck:tests` and wire it into `.github/workflows/ci.yml`.
- [x] FINAL. Validation
  - Run `npm run lint`, `npm run typecheck`, `npm run test:ci`, `npm run build`, and `npm audit --audit-level=moderate`.

# Acceptance
- Offline catch-up does not freeze the UI after long absences; behavior is either scalable or explicitly capped with guard rails.
- Store subscriptions avoid broad invalidations; key panels rerender less for unrelated state changes.
- React Hooks lint rules are enabled and the codebase is clean under them.
- Dependencies are correctly classified; no unused runtime deps.
- CI includes TypeScript typechecking for `tests/` and passes.

# Status (applied)
- Runtime catch-up is capped and processed in larger steps; offline recap now shows `Time away` vs `Processed` when capped.
- `useGameStore` supports selector equality via memoized snapshots (optional `isEqual` parameter).
- React Hooks linting is enabled; conditional-hook issues and dependency warnings fixed.
- `glob` removed; `jest-axe` moved to `devDependencies`; lockfile updated; `npm audit` clean.
- Added `tsconfig.tests.json` + `npm run typecheck:tests` and wired into CI and release workflows.
