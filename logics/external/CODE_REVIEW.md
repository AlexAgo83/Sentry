# Code Structure Review

_Generated: 2026-01-31 14:44 UTC_

## Detected stack (heuristic)

- Primary guess: `js/ts-react` (confidence: medium)
- Signals:
  - Found package.json
  - TypeScript present
  - React dependency

## Scan results

- Code files scanned: 181
- Largest by lines: `src/data/definitions/recipes.ts` (830 lines)

## Large files (>= 400 lines)

| File | Lines | Size |
|---|---:|---:|
| `src/data/definitions/recipes.ts` | 830 | 27869 |
| `tests/app/panels.test.tsx` | 536 | 20044 |
| `src/app/components/SidePanelSwitcher.tsx` | 527 | 23346 |
| `src/core/runtime.ts` | 515 | 19259 |
| `tests/core/runtime.test.ts` | 433 | 18408 |
| `src/app/components/ActionSelectionScreen.tsx` | 419 | 22538 |

## Top 20 files by lines

| File | Lines | Size |
|---|---:|---:|
| `src/data/definitions/recipes.ts` | 830 | 27869 |
| `tests/app/panels.test.tsx` | 536 | 20044 |
| `src/app/components/SidePanelSwitcher.tsx` | 527 | 23346 |
| `src/core/runtime.ts` | 515 | 19259 |
| `tests/core/runtime.test.ts` | 433 | 18408 |
| `src/app/components/ActionSelectionScreen.tsx` | 419 | 22538 |
| `tests/core/loop.test.ts` | 391 | 14903 |
| `src/core/reducer.ts` | 362 | 12729 |
| `tests/app/App.test.tsx` | 359 | 16293 |
| `src/core/loop.ts` | 350 | 11788 |
| `src/app/hooks/useCloudSave.ts` | 339 | 12280 |
| `src/app/components/InventoryPanel.tsx` | 333 | 16055 |
| `src/app/ui/inventoryIcons.tsx` | 322 | 8343 |
| `src/app/containers/ActionSelectionScreenContainer.tsx` | 312 | 13006 |
| `src/app/components/CharacterSkinPanel.tsx` | 300 | 13144 |
| `backend/server.js` | 289 | 9471 |
| `src/app/components/CloudSavePanel.tsx` | 283 | 11624 |
| `src/core/state.ts` | 283 | 9307 |
| `src/app/dev/renderDebug.tsx` | 276 | 7825 |
| `tests/public/sw.test.ts` | 274 | 9354 |

## Recommendations

- Prefer smaller files with one responsibility; split very large modules into cohesive units.
- Introduce clear folder boundaries (e.g., `src/` + subdomains) and keep entrypoints thin.
- Avoid dumping unrelated helpers into `utils/`; prefer domain-scoped helpers next to their usage.
- Keep configuration and environment wiring separate from business logic.
- React: split large UI files into `components/` and extract non-UI logic into hooks (`use*`) or services.
- React: keep container/page components thin; move reusable pieces into feature folders.

## Next actions (concrete)

- Pick the top 1–3 largest files and identify natural seams (types/models, IO boundaries, feature sections).
- Extract one seam at a time into a new module/package; keep the original file as an orchestrator.
- Add a simple guardrail: fail CI if new files exceed the threshold (once the stack is known).
