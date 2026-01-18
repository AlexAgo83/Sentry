## item_012_app_ui_extractions - Extract modals + hooks from App.tsx
> From version: 0.7.1
> Understanding: 97%
> Confidence: 93%
> Progress: 90%

# Context
`App.tsx` still owns modal markup, derived view logic (inventory filtering/pagination), and formatting helpers. This keeps the file large and makes changes noisy.

# Goal
Reduce `App.tsx` complexity by extracting modal components, focused hooks, and UI helper modules while keeping behavior unchanged.

# Needs
- Extract modal components: Loadout, Recruit, Rename, System, Offline Summary (and share a modal shell if useful).
- Create hooks for derived data: inventory view (filter/sort/pagination/selection), pending action selection, action status.
- Move formatting helpers (item list/delta labels, skill color map) into `src/app/ui/`.
- Keep store reads in `App.tsx`, but pass stable props into components.
- Keep styles/class names unchanged; no visual redesign.
- Add tests for at least one modal interaction and one hook-driven view (modal open/close and inventory hook outputs first).

# Decisions
- Use `React.memo` for modal components to reduce avoidable re-renders.
- Use `useMemo` inside hooks to stabilize derived collections and labels.
- Use a shared `ModalShell` component for common backdrop/header/close behavior.
- Merge Recruit/Rename into a configurable `HeroNameModal` to reduce duplication.
- Keep modal open/close state in `App.tsx` (no extra state hook for now).
- Keep `HeroNameModal` validation minimal to match current behavior (no new messages).
- Have `ModalShell` handle backdrop clicks + Escape by default, with optional overrides.
- Keep hooks data-only; labels like "None" or "Missing: ..." stay in `App.tsx` or components for future i18n.
- Keep inventory selection state in `App.tsx` and pass it down to inventory components.
- `useInventoryView` accepts inputs (definitions/meta/usage) as params to improve testability.
- Avoid a separate selectors module; keep derived maps in hooks.
- Keep hooks in `src/app/hooks/` and helpers in `src/app/ui/`.
- Keep modal prop types inline (no new `types/` folder).
- Use `components/`, `hooks/`, `ui/` under `src/app/` with `PascalCase.tsx` for components and `camelCase.ts` for hooks/helpers.

# Scope (v1)
- No routing or state management changes.
- No new features; behavior parity only.
- No CSS refactor beyond moving existing class usage into extracted components.
- No snapshot tests; prioritize interaction tests (RTL/Vitest).

# Acceptance
- App complexity reduced (major modal blocks removed from `App.tsx`).
- Extracted components render identical UI and behavior.
- Inventory pagination/selection and action start/stop behavior remain unchanged.
- Tests cover at least: modal open/close + inventory hook output.
- React Profiler shows reduced wasted renders for `App.tsx` (qualitative check).
- No regression in existing performance metrics.

# Open questions
- None for v1.
