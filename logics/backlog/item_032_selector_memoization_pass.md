## item_032_selector_memoization_pass - Selector memoization pass
> From version: 0.8.13
> Understanding: 80%
> Confidence: 70%
> Progress: 100%

# Context
Some panels re-render more often than needed due to non-memoized selectors and broad store subscriptions.

# Goal
Reduce unnecessary re-renders via memoized selectors and shallow comparisons.

# Scope (v1)
- Identify heavy panels (Roster, Inventory, Action, Shop) and their selectors.
- Introduce memoized selectors for derived data.
- Use shallow equality where appropriate in store hooks.

# Acceptance
- No change in behavior.
- Reduced render counts in dev profiler (qualitative).

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
