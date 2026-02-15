## req_043_bundle_performance_leaderboard_scalability_and_ci_flaky_hardening - Improve bundle performance, leaderboard scalability, and CI flaky resilience
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Complexity: High
> Theme: Refactor
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Reduce initial app payload and remove recurring `chunks > 500kb` warning pressure.
- Make leaderboard query path scalable as save volume grows.
- Reduce CI red runs caused by flaky tests and add early stability detection.

# Context
- Current production build reports at least one chunk above 500kb.
- Leaderboard backend currently relies on page/offset (`skip/take`) ordering by score and timestamp.
- Offset pagination degrades as row count increases and becomes expensive under high cardinality.
- Recent CI failures included flaky behavior in a critical save envelope test path.

# Goals
- Improve startup and interaction performance by splitting heavy UI/code paths.
- Move leaderboard to an index-friendly cursor-based pagination contract while preserving ranking behavior.
- Introduce CI guardrails that surface flaky tests before they break default pipeline confidence.

# Locked decisions (v1)
- Keep existing product UX semantics for `Settings`, `Leaderboard`, and modal navigation.
- Leaderboard remains infinite-scroll in batches of 10 entries.
- Backend introduces cursor pagination and supports deterministic ordering on:
  - `virtualScore DESC`
  - `updatedAt DESC`
  - `id ASC`
- Cursor payload must be opaque to UI consumers (encoded token or explicit triplet contract).
- Ranking tie marker (`ex aequo`) behavior must stay consistent.
- CI adds a dedicated flaky detection gate for selected critical tests.
- Final delivery requires the complete test battery.

# Scope detail (draft)
- Bundle performance
  - Introduce lazy loading for heavy system modal views and other low-frequency paths.
  - Keep first-view/core gameplay path eager.
  - Align chunk budgets with realistic targets and expose build artifacts for diagnosis.

- Leaderboard scalability
  - Add DB index and migrate API route to cursor-based pagination.
  - Keep per-page max at 10 for UI consistency.
  - Preserve existing response fields (`displayName`, `virtualScore`, `updatedAt`, `appVersion`, `isExAequo`).

- CI flaky resilience
  - Add repeat/stability command for designated critical tests.
  - Add CI step to run stability checks before later expensive stages.
  - Keep diagnostics clear in CI logs to identify which test is unstable.

# Technical references to update
- `src/app/components/SystemModal.tsx`
- `src/app/components/LeaderboardModal.tsx`
- `src/app/api/leaderboardClient.ts`
- `backend/server.js`
- `prisma/schema.prisma`
- `prisma/migrations/*`
- `scripts/check-bundle-size.js`
- `.github/workflows/ci.yml`
- `package.json`

# Acceptance criteria
- Build chunk warnings are reduced via lazy split of heavy optional surfaces.
- Leaderboard endpoint uses cursor strategy with stable ordering and infinite-scroll compatibility.
- Leaderboard DB access path is index-backed and avoids offset-scan behavior.
- CI includes flaky detection stage for critical tests and reports failures clearly.
- Full validation battery passes.

# Test expectations
- Mandatory validation at end:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
  - `npm run coverage:ci`
  - `npm run build`
  - `npm run test:e2e`
- Additional expected checks:
  - leaderboard backend tests for cursor progression and tie behavior.
  - frontend leaderboard tests for infinite-scroll append behavior.
  - flaky test repetition script validation in CI-like mode.

# Risks / open points
- Cursor migration can break existing clients if not backward-compatible during rollout.
- Lazy loading may introduce UX flashes if loading states are not explicit.
- Overly strict flaky gates may create false negatives if not scoped to truly critical tests.

# Backlog
- `logics/backlog/item_133_split_heavy_optional_ui_paths_with_lazy_loading_and_chunk_reduction.md`
- `logics/backlog/item_134_add_bundle_observability_and_budget_guardrails_for_split_strategy.md`
- `logics/backlog/item_135_migrate_leaderboard_backend_to_indexed_cursor_pagination.md`
- `logics/backlog/item_136_update_leaderboard_frontend_infinite_scroll_to_cursor_contract.md`
- `logics/backlog/item_137_add_ci_flaky_detection_stage_for_critical_test_paths.md`
- `logics/backlog/item_138_add_regression_coverage_and_full_battery_validation_for_request_043.md`
