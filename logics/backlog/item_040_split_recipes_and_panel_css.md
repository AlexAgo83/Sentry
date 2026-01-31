## item_040_split_recipes_and_panel_css - Split monolithic recipes and panel CSS
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Problem
Promoted from `logics/request/req_015_technical_review.md`.
Large monolithic files (recipes and CSS) slow review and increase coupling.

# Scope
- In:
  - Split `recipes.ts` strictly by skill and re‑export via an index.
  - Split large CSS files by panel (keep global tokens in core).
  - Keep a central index/façade for imports.
  - Ensure build output and imports remain stable.
- Out:
  - Any gameplay changes.

# Acceptance criteria
- Recipes are organized by skill modules and exported from a central index.
- CSS for major panels lives in separate files with clear ownership.
- No visual or gameplay regressions.
- Build and tests pass without import churn.

# Priority
- Impact: Medium (maintainability).
- Urgency: Low.

# Notes
- Prefer gradual split (one file at a time).
- Keep CSS import order explicit to minimize override changes.
