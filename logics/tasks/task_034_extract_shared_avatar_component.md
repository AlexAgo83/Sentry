## task_034_extract_shared_avatar_component - Extract shared Avatar component
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_039_extract_avatar_component.md`.
Normalize avatar rendering everywhere it appears using a shared component.

# Plan
- [x] 1. Inventory all avatar usages and define a shared props interface.
- [x] 2. Implement the shared Avatar component with size/placeholder/outline variants.
- [x] 3. Replace all avatar instances with the shared component.
- [x] 4. Add snapshot test coverage for the shared component.
- [x] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npm run lint
- npm run build

# Report
- Status: complete.
- Added shared `Avatar` component and replaced roster/skin usages.
- Added unit test for avatar layers and optional skill icon.
- Validation: `npm run test:ci -- tests/app/avatar.test.tsx`.

# Notes
