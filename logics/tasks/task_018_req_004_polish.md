## task_018_req_004_polish - Close remaining UX backlog + gameplay polish + release hardening
> From version: 0.8.8  
> Understanding: 95%  
> Confidence: 90%  
> Progress: 100%

# Context
This task executes `logics/request/req_004_polish.md` by turning it into an actionable, end-to-end checklist.

It focuses on:
- Shipping the remaining UX work in `logics/backlog/item_016_mobile_bottom_action_bar.md`.
- Reconciling doc status for `logics/backlog/item_013_qa_feedback_sweep.md` vs `logics/tasks/task_013_qa_feedback_sweep.md`.
- Adding minimal “real gameplay” polish on top of the delivered systems (events/buffs + early-game tuning).
- Running a release hardening pass and bumping the version.

# Goals
1. Desktop/mobile navigation feels consistent and ergonomic (proper app bars + safe areas + modal interactions).
2. Product docs match reality (no “done” task with a “not done” backlog item).
3. Add at least one concrete gameplay loop improvement (temporary modifiers sources + UI + persistence + tests).
4. Release pipeline is green (`lint`, `typecheck`, `test:ci`, `build`) and version is bumped.

# Non-goals
- No full UI redesign (only app-shell/navigation polish and minor tweaks required by the scope).
- No large engine refactor or new progression system; keep gameplay additions minimal and testable.
- No new complex content pipeline (keep additions in the existing `src/data` patterns).

# Decisions (confirmed)
- Priority order:
  1) Deliver `logics/backlog/item_016_mobile_bottom_action_bar.md`.
  2) Reconcile docs for `logics/backlog/item_013_qa_feedback_sweep.md`.
  3) Add one minimal “real gameplay” buff source (temporary modifier).
  4) Release hardening + version bump.
- Mobile breakpoint: `max-width: 720px`.
- “Modal open” (hide app bars): any overlay that blocks background interaction (Setup, Dev, Offline recap, SweetAlert2, anything with `role="dialog"` and/or `aria-modal="true"`).
- Mobile bottom bar: always visible (no auto-hide on scroll in v1).
- Fixed bar overlap strategy: app-shell padding driven by CSS variables (avoid per-panel hacks).
- Visual style: reuse current “glass” language; provide a non-blur fallback; keep transitions short; disable animations with `prefers-reduced-motion`.
- Tight widths tabs: mobile uses icons + short labels; mid-width tight uses icons-only + tooltip + `aria-label` while keeping `tablist/tab` semantics.
- Minimal gameplay polish (v1): “Rested” buff on return from offline (away ≥ 15 min) → `+2 Endurance` (flat) for 10 min, `stackKey: "rested"` refreshes duration (no stacking).
- Version bump target: `0.8.9` (patch).

# Plan
- [x] 1. Baseline + scope lock
  - Re-read `logics/request/req_004_polish.md`, `logics/backlog/item_016_mobile_bottom_action_bar.md`, and `logics/backlog/item_013_qa_feedback_sweep.md`.
  - Confirm nothing conflicts with the decisions above (and adjust if implementation reality requires it).
  - Create a short “manual QA checklist” for desktop + mobile (to run at the end).

- [x] 2. Doc reconciliation (QA sweep status)
  - Compare `logics/backlog/item_013_qa_feedback_sweep.md` acceptance criteria with what is implemented.
  - If everything is already delivered:
    - Update `logics/backlog/item_013_qa_feedback_sweep.md` to `Progress: 100%` and add a short “Status” note.
  - If something is missing:
    - Add a short delta list to this task (missing items + file locations), implement, and update tests.

- [x] 3. App bars (deliver `item_016_mobile_bottom_action_bar`)
  - Desktop top bar (fixed):
    - Render `Title + SidePanelSwitcher + Setup + Dev` in a single consistent bar.
    - Ensure the current `tablist`/`tab` semantics and focus styles remain intact.
    - Ensure body/content is padded so fixed bars do not overlap interactive UI.
  - Mobile bars (fixed):
    - Top bar: `Title + Setup + Dev`.
    - Bottom bar: `SidePanelSwitcher` (icons + short labels if needed).
    - Add safe-area padding via `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`.
  - Modals:
    - Hide both bars while a modal is open (as defined in step 1).
    - Add subtle slide/fade transitions for show/hide; disable with `prefers-reduced-motion`.
  - Responsive mid-width behavior:
    - If space is tight, switch tabs to icons with tooltips while keeping accessibility semantics.
  - Tests:
    - Add RTL tests that assert which bar contains `SidePanelSwitcher` at desktop vs mobile widths.
    - Add tests for “bars hidden when modal open”.

- [x] 4. “Real gameplay” polish (minimal, but complete)
  - Temporary modifiers sources:
    - Add at least one deterministic source of a temporary buff (e.g., “Rested” on return from offline, or a timed “Campfire” buff).
    - Ensure it uses the existing stat/modifier model (id, stat, kind, value, source, expiresAt/stackKey).
    - Ensure modifiers persist and expire correctly on resume/ticks.
  - UI:
    - Show active temp modifiers in the Stats panel (existing patterns: chips + timers on hover or inline).
    - Keep it minimal and consistent with the current UI.
  - Balance tuning (early-game):
    - Make one small, measurable tuning change (shipped: add “Rested” buff) and document it in this task.
  - Tests:
    - Unit tests for modifier application/expiry and persistence.
    - One UI smoke test that the modifier appears for an active player.

- [x] 5. Release hardening + version bump
  - Run:
    - `npm run lint`
    - `npm run typecheck`
    - `npm run test:ci`
    - `npm run build`
    - (optional but recommended) `npm audit --audit-level=moderate`
  - Fix any regressions found (scoped to this task’s changes).
  - Bump version to `0.8.9` in `package.json` (and lockfile if needed) and ensure the UI version badge matches.

- [x] FINAL. Docs + sign-off
  - Update:
    - `logics/backlog/item_016_mobile_bottom_action_bar.md` → `Progress: 100%` + short status note.
    - `logics/backlog/item_013_qa_feedback_sweep.md` → `Progress: 100%` (or leave with explicit remaining deltas).
    - This task file: set `Understanding`, `Confidence`, `Progress`, and add a short `# Report` section with what shipped.
  - Manual QA checklist:
    - Desktop: top bar visible, tabs accessible, no overlap, modals hide bars, reduced-motion respected.
    - Mobile: top+bottom bars visible, safe-area correct, bottom nav reachable, no overlap with key actions/modals.

# Acceptance
- `item_016_mobile_bottom_action_bar` is fully delivered (desktop top bar + mobile top/bottom bars + safe areas + modal behavior + reduced-motion).
- Docs are consistent: no backlog item left at <100% when the task is completed (or explicit deltas are documented).
- At least one temporary modifier source exists, is visible in UI, persists, and expires correctly (with tests).
- `npm run lint`, `npm run typecheck`, `npm run test:ci`, and `npm run build` succeed.
- Version is bumped for the release containing these changes.

# Report
- App bars: mobile bottom bar is always visible; app bars hide while any modal is open; added mid-width topbar tabs icon-only mode; added SweetAlert2 (`.swal2-shown`) fallback for bar hiding.
- Gameplay polish: added a deterministic “Rested” temporary buff after long offline catch-ups (Endurance +2 flat, 10m, refresh via `stackKey: "rested"`), persisted in saves and visible in Stats.
- Docs: updated `item_013` and `item_016` to reflect shipped behavior and set progress to 100%.
- Validation: `npm run lint`, `npm run typecheck`, `npm run test:ci`, `npm run build` all green; version bumped to `0.8.9`.
