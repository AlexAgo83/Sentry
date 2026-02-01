## req_004_polish - Global polish
> From version: 0.8.9
> Understanding: 90%
> Confidence: 80%

# Needs
A few good next moves in this repo (based on `logics/backlog/`):

# Priorities (confirmed)
1. Deliver `logics/backlog/item_016_mobile_bottom_action_bar.md`.
2. Reconcile docs status for `logics/backlog/item_013_qa_feedback_sweep.md` vs `logics/tasks/task_013_qa_feedback_sweep.md`.
3. Add one minimal “real gameplay” improvement (temporary modifier source + UI + persistence + tests).
4. Release hardening (`lint`, `typecheck`, `test:ci`, `build`) + version bump.

# Constraints / decisions (confirmed)
- Mobile breakpoint: `max-width: 720px`.
- Mobile bottom bar: always visible (no auto-hide in v1).
- “Modal open” (hide app bars): any overlay that blocks background interaction (Setup, Dev, Offline recap, SweetAlert2, anything with `role="dialog"` and/or `aria-modal="true"`).
- Fixed bars must not overlap content: use app-shell padding (CSS variables), not per-panel hacks.
- Transitions must respect `prefers-reduced-motion`.
- Tab semantics must remain `tablist/tab` with accessible labels.

# Gameplay polish (v1)
- Add a “Rested” buff on return from offline (away ≥ 15 min) → `+2 Endurance` (flat) for 10 min.
- Use `stackKey: "rested"` to refresh duration (no stacking).

# Release target
- Bump version to `0.8.9` (patch) after validation.

# Execution
- Tracked as `logics/tasks/task_018_req_004_polish.md`.

# Context
Add context and constraints.

# Backlog
- (none yet)
