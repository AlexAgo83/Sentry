## item_039_extract_avatar_component - Extract shared Avatar component
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Problem
Promoted from `logics/request/req_015_technical_review.md`.
Avatar layer markup is duplicated across roster and skin panels, which increases drift and regression risk.

# Scope
- In:
  - Create a shared Avatar component that renders the layer stack.
  - Normalize usage everywhere the avatar appears (roster, skin preview, any other panels).
  - Move common style variables and props into a single interface.
  - Add a snapshot test for avatar rendering.
- Out:
  - Major visual redesign of the avatar.

# Acceptance criteria
- All avatar usages render the exact same structure.
- No visual regressions in avatar appearance.
- Avatar component is reusable with size/placeholder/outline variants.
- Test covers the shared component output.

# Priority
- Impact: Medium (reduce drift).
- Urgency: Low.

# Notes
- Keep API minimal: style vars + equipment + optional skill icon.
