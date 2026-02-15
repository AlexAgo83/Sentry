## item_159_split_core_runtime_and_renderer_hotspots_phase2 - Split core runtime/renderer hotspots into smaller modules (phase 2)
> From version: 0.9.31
> Understanding: 85%
> Confidence: 75%
> Progress: 0%
> Complexity: High
> Theme: Refactor
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Core runtime and renderer modules are large and tightly coupled, increasing regression risk and making it harder to make targeted fixes (offline, timing, VFX, etc.).

# Scope
- In:
- Split large modules in low-risk seams:
  - `src/core/runtime.ts` (persistence, offline catch-up, perf tracking)
  - `src/core/loop.ts` (pure tick math vs side effects)
  - `src/app/components/dungeon/renderer/updateFrame.ts` (scene update vs effect application)
- Prefer extracting pure functions first and keeping side effects localized.
- Add a small “hotspot guide” (where new code should go) to prevent re-growth.
- Out:
- No behavior changes; refactor only.

# Acceptance criteria
- Hotspot modules are split into domain-focused files with clear boundaries.
- All tests pass; no runtime regressions.

# Priority
- Impact: Medium
- Urgency: Low

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.
- Should be executed after phase 1 correctness hardening and test additions.

