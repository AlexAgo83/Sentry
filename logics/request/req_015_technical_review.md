## req_015_technical_review - Technical review and improvement backlog
> From version: 0.8.17
> Understanding: 92%
> Confidence: 80%

# Needs
Produce a deep technical review of the project and capture all findings as a prioritized improvement list. The output should be actionable for follow-up backlog/tasks.

# Context
- Repo is a Vite + React front-end with a game loop, persistence, and a Fastify + Prisma backend for cloud save.
- Review should focus on maintainability, risks, performance, test gaps, and architecture boundaries.
- No feature implementation in this request; output is analysis + recommendations only.
- Mode: full audit (deep review).
- Scope: front-end, back-end, data/content, and Logics docs.
- Focus: balanced coverage across areas (no single domain prioritized).
- Findings: include risks/bugs, technical debt, and improvement opportunities.
- Recommendations: include effort/impact estimates and be ready to convert into backlog/tasks.
- Output detail: what/why only (no code-level refactor examples).
- Refactors are allowed and encouraged.
- Include test strategy recommendations (E2E, perf, security).

# Audit summary
- Codebase is stable and test-rich (unit/integration), but lacks E2E coverage and perf/security regression checks.
- Backend is functional but security posture is “MVP”; rate limiting and token lifecycle should be hardened before scale.
- Content/data is centralized but monolithic (large recipe file), and CSS is globally scoped, increasing coupling.
- Logics docs are mostly complete, with a few template placeholders still present.

# Findings (prioritized)

## P0 / High risk
- None detected that block dev use. For production/staged public exposure, see P1 security items.

## P1 / Medium risk
1) **Backend security and resilience are MVP‑level.**
   - In‑memory rate limit: bypassed in multi‑instance deployments and can grow unbounded by unique IPs.
   - Refresh tokens are stateless and not revocable; compromised refresh tokens remain valid until expiry.
   - No CSRF protection on refresh endpoint beyond SameSite cookie behavior.
   - **Why it matters:** Increased risk of abuse or account compromise in production.
   - Effort: M | Impact: H

2) **Save payload is not validated.**
   - Server stores any JSON payload; schema mismatches and corrupted saves are possible.
   - Client relies on local version and migrations without server-side guardrails.
   - **Why it matters:** Hard‑to‑recover data corruption and migration breakage.
   - Effort: M | Impact: H

3) **Persistence failure disables saving without a user‑visible warning.**
   - Runtime stops persisting after repeated failures but only logs once.
   - **Why it matters:** Silent data loss risk; users may continue playing unaware.
   - Effort: S | Impact: H

4) **Global CSS and duplicated avatar DOM increase regression risk.**
   - Large global CSS files and repeated avatar layer markup in multiple components.
   - **Why it matters:** Small changes can break unrelated panels or create divergent UI.
   - Effort: M | Impact: M

5) **Non‑deterministic RNG in the core loop.**
   - Rare rewards use `Math.random()` with no seed.
   - **Why it matters:** Harder to reproduce bugs and validate offline catch‑up deterministically.
   - Effort: M | Impact: M

## P2 / Low risk / DX
1) **Large files slow reviews and increase diff noise.**
   - Biggest hotspots: `src/data/definitions/recipes.ts`, `src/app/styles/stats-action.css`, `src/app/styles/inventory-nav-equipment.css`, `src/app/styles/core.css`, `src/core/runtime.ts`, `src/core/reducer.ts`, `src/core/loop.ts`, `src/app/components/ActionSelectionScreen.tsx`, `src/app/hooks/useCloudSave.ts`.
   - Effort: M | Impact: M

2) **No E2E test coverage for critical flows.**
   - Local save, cloud auth, conflict resolution, inventory sell, mobile layout.
   - Effort: M | Impact: M

3) **No perf/bundle budgets.**
   - Risks slow regressions slipping in (CSS and asset growth).
   - Effort: S | Impact: M

4) **Logics doc hygiene.**
   - A few example docs still have `??%` indicators and placeholders.
   - Effort: S | Impact: L

# Evidence / Audit notes
- Code structure review generated: `logics/external/CODE_REVIEW.md`.
- Logics doc review generated: `logics/external/REVIEW.md`.
- Largest files and hotspots are listed in `logics/external/CODE_REVIEW.md`.

# Test gaps & validation recommendations
- **E2E smoke tests (Playwright or similar):** new game creation, cloud auth + upload/download, conflict resolution, inventory sell, mobile roster view.
- **Backend integration:** refresh token rotation + invalid refresh handling + rate limit behavior.
- **Visual regression:** avatar rendering (silhouette/skin editor) and roster cards.
- **Perf checks:** offline catch‑up with large deltas; build size/bundle budgets.

# Backlog‑ready recommendations (effort/impact)

1) **Harden auth + rate limiting** (M/H)
   - Use shared rate-limit store (Redis) or Fastify store adapter.
   - Add refresh token rotation with revocation support.
   - Add CSRF protection for refresh endpoint.

2) **Validate save payloads server‑side** (M/H)
   - Add schema version validation and basic shape checks.
   - Reject or quarantine invalid payloads.

3) **Expose persistence failure UI** (S/H)
   - Add a user‑visible banner/toast when persistence is disabled.
   - Provide a retry button or automatic re-enable with backoff.

4) **Extract Avatar component + shared layer list** (M/M)
   - Single DOM structure; share styles between roster and skin panel.

5) **Split monolithic data/CSS files** (M/M)
   - Per‑skill recipe modules and per‑panel CSS files.

6) **Seeded RNG for tick rewards** (M/M)
   - Deterministic RNG per player + tick timestamp.

7) **E2E smoke suite** (M/M)
   - 3–5 critical flow tests.

8) **Bundle/perf budgets** (S/M)
   - Report build size and block regressions beyond a threshold.

9) **Logics hygiene cleanup** (S/L)
   - Clear `??%` indicators in example docs and remove placeholders.

# Suggested evolution tracks (2–4 quarter horizon)
- Modularize core logic into domain reducers (players, inventory, quests, cloud) and reduce cross‑file coupling.
- Data‑driven content pipeline (CSV/JSON + build step) for recipes/items.
- Observability dashboard for runtime performance and save failures.

# Deliverables
- Convert P1 items into backlog entries with acceptance criteria.
- Add a test plan task for E2E + backend integration coverage.
- Optional: architecture note for save schema + migration policy.

# Backlog
- `logics/backlog/item_036_harden_cloud_auth_rate_limiting.md`
- `logics/backlog/item_037_validate_cloud_save_payloads.md`
- `logics/backlog/item_038_persistence_failure_ui_alert.md`
- `logics/backlog/item_039_extract_avatar_component.md`
- `logics/backlog/item_040_split_recipes_and_panel_css.md`
- `logics/backlog/item_041_seeded_rng_for_rewards.md`
- `logics/backlog/item_042_e2e_smoke_suite.md`
- `logics/backlog/item_043_bundle_perf_budgets.md`
- `logics/backlog/item_044_logics_hygiene_cleanup.md`
