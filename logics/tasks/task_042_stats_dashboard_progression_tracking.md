## task_042_stats_dashboard_progression_tracking - Stats dashboard progression tracking
> From version: 0.8.18
> Understanding: 94%
> Confidence: 92%
> Progress: 100%

# Context
Derived from `logics/backlog/item_047_stats_dashboard_progression_tracking.md`

# Plan
- [x] 1. Data model: add rolling 7‑day buckets for XP/Gold + active/idle time + per‑skill active time.
- [x] 2. Aggregation: update buckets daily (local midnight), include offline gains, retain last 7 days only.
- [x] 3. UI: replace Stats panel with Progression dashboard (cards, split bar, top 5 list, trend chart).
- [x] 4. UI: add Character tab with base + perm/temp/gear breakdown and totals.
- [x] 5. Mobile layout: stack sections in priority order (cards → split → top list → chart).
- [x] 6. Persistence: ensure save payload includes new tracking data (local + cloud).
- [x] 7. Tests/QA: add unit tests for bucketing + aggregation; verify UI on mobile + desktop.
- [x] FINAL: update related Logics docs if scope changes.

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run test:ci
- npm run coverage
- npm run build
- npm run test:e2e

# Report
- Added rolling 7‑day progression tracking (XP, gold, active/idle time, per‑skill time) with save hydration/migration; fixed per‑hero persistence on migration.
- Replaced Stats panel with a progression dashboard + Hero statistics view; added global vs hero progression switch and responsive controls.
- Added clearer trend chart (axis labels, tooltip, legend), updated skill list to show all skills, refined spacing and layout.
- Hero virtual score is now independent from global score.
- Tests run: `npm run lint`, `npm run typecheck`, `npm run tests`, `npm run test:ci`, `npm run coverage`, `npm run build`, `npm run test:e2e`.
- Pending QA: none.

# Notes
- Mockups: `logics/external/mockup/` (progression + character, mobile + desktop).

# Clarifications

- Define the primary outcome and scope boundaries (in/out). :: In: core deliverables. Out: adjacent features or polish.
- Define time window and granularity for any trends/rollups. :: Rolling 7-day window, daily buckets, local midnight.
- Define metric sources and what counts (include offline or background gains?). :: Use deltas, include offline/background gains if applicable.
- Define active vs inactive time rules (if relevant). :: Active = process/action running. Inactive = no active process.
- Define mobile vs desktop layout expectations. :: Mobile-first with condensed order; desktop uses a broader dashboard layout.
- Define persistence and retention. :: Persist in saved state; retain only the last 7 days of data.
- Define edge cases and empty states. :: No data -> zeros + empty state; new users -> seeded buckets.
- Define implementation checkpoints. :: Plan: data model -> aggregation -> UI -> QA.
- Define validation commands. :: Run lint/tests/build relevant to the change.
