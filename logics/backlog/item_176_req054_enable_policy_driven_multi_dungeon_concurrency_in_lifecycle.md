## item_176_req054_enable_policy_driven_multi_dungeon_concurrency_in_lifecycle - req054 enable multi-dungeon concurrency in lifecycle
> From version: 0.9.36
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Large
> Theme: Gameplay / Core Dungeon Lifecycle
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Dungeon state is multi-run capable, but runtime lifecycle still enforces single-run behavior. This blocks concurrent dungeon progression and prevents the UI from managing several active runs in parallel.

# Scope
- In:
- Remove v1 single-run gating in dungeon start lifecycle.
- Keep existing start validation: 4 heroes, unique heroes, roster existence, food checks.
- Preserve deterministic run finalization and fallback active run selection when one run ends.
- Keep hero assignment exclusivity across active runs.
- Out:
- Run tab UI/interaction work (covered in item_178 and item_179).
- Replay UX redesign (out of req054 scope).

# Acceptance criteria
- More than one dungeon run can be active concurrently.
- No hero can be assigned to two active runs.
- Ending one run does not interrupt progression of other active runs.
- Active run fallback remains deterministic after run removal.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_054_multi_dungeon_parallel_runs_with_tab_navigation.md`.
- Likely touch points:
  - `src/core/dungeon/lifecycle.ts`
  - `src/core/dungeon/state.ts`
  - `src/core/dungeon/tick.ts`
  - `src/core/reducer.ts`
