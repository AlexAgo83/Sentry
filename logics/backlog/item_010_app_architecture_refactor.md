## item_010_app_architecture_refactor - Break up App.tsx + render optimizations
> From version: 0.5.0
> Understanding: 95%
> Confidence: 92%
> Progress: 100%

# Context
`App.tsx` owns a large amount of UI, derived data, and interaction logic. This increases render cost and makes changes harder to isolate.

# Goal
Improve maintainability and reduce unnecessary re-renders by splitting the UI into focused components and memoizing derived data.

# Needs
- Extract major panels (Roster, Action Status, Character Stats, Inventory) into components.
- Memoize derived maps/lists (`items`, `skills`, `usage`) and pass stable props.
- Use `React.memo` and `useMemo` where appropriate to reduce re-renders.
- Keep UI behavior unchanged.
- Add targeted tests to ensure panels still render and interact correctly.

# Defaults (proposal)
- Create a `src/app/components/` directory with panel components.
- Panel split order: Inventory → Roster → Character Stats → Action Status.
- Keep `App.tsx` as the data source and pass props down (no store reads in panels).
- Use `React.memo` + `useMemo` for stable derived data and props.
- Keep styles and class names unchanged.

# Scope (v1)
- No visual redesign.
- No routing or state management changes.

# Acceptance
- App renders the same UI with identical behavior.
- Measurable reduction in unnecessary re-renders (basic profiling or React DevTools).
- Tests cover each extracted panel’s core interactions.

# Tests
- Preserve existing UI tests.
- Add one focused test per panel (render + primary interaction).

# Open questions
- None for v1.

# Problem
Describe the problem and user impact.

# Scope
- In:
- Out:

# Acceptance criteria
- Define acceptance criteria

# Priority
- Impact:
- Urgency:

# Notes
