## task_011_app_architecture_and_ci_hardening - App split, deps hygiene, CI docs
> From version: 0.6.3  
> Understanding: 92%  
> Confidence: 90%  
> Progress: 100%

# Context
App.tsx remains large despite extracted panels. Inventory controls and panel switching still hurt readability and testing. Npm reported vulnerabilities (1 low, 1 moderate, 1 high). CI/local workflows need clearer documentation and a status badge.

# Goal
Simplify the app architecture for readability/tests, fix npm vulnerabilities, and clearly document the CI/local workflow (with a status badge).

# Plan
- [x] 1. App architecture (item_010): large refactor allowed. Extract dedicated subcomponents (InventoryControls, SidePanelSwitcher, modals/loadout/offline recap where relevant), share persistence hooks, shrink App.tsx without changing behavior. Add RTL tests for panel switching and filter persistence.
- [x] 2. Dependency security: run `npm audit fix` or targeted updates to resolve vulnerabilities (low/moderate/high) while staying compatible; add a CI audit job/step that fails at moderate+ and warns on low.
- [x] 3. CI/local documentation: enrich README and CONTRIBUTING with local/CI workflow (dev, lint, tests, coverage, audit) and add a GitHub Actions status badge.
- [x] 4. E2E offline recap smoke: add a test (Playwright or stronger RTL) covering the offline resume cycle (recap displayed and acknowledged).
- [x] 5. Perf/UI: profile Inventory/Stats render counts and add targeted memo/React.memo for large lists (200+ items).
- [x] 6. Accessibility: run axe/jest-axe on Roster/Inventory/Stats, fix contrast/focus issues.
- [x] 7. Persistence hooks: extract into a dedicated module with unit tests (reset, storage errors, defaults).
- [ ] 8. CI quality: add a “preview build + smoke” job (vite build + preview + RTL smoke) on each PR/push to catch bundling errors before merge.
- [ ] FINAL: Validate acceptance, update docs/backlog/task status, and verify performance.

# Acceptance
- App.tsx slimmed down: inventory controls and panel switch extracted, persistence hooks reusable, existing tests green.
- `npm audit` reports no vulnerabilities (or explicitly ignored/documented), CI includes a vuln check (fails at moderate+).
- README/CONTRIBUTING clearly describe local/CI commands (dev, lint, tests, coverage, audit) and display a GitHub Actions badge.
- Offline recap smoke validates the resume scenario; UI perf improved via targeted memo; a11y fixes on panels; preview+smoke job in CI passes.
