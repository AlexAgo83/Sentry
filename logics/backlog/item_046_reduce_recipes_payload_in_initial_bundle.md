## item_046_reduce_recipes_payload_in_initial_bundle - Reduce recipes payload in initial bundle
> From version: 0.8.18
> Understanding: 90%
> Confidence: 88%
> Progress: 0%

# Problem
`src/data/definitions/recipes` is a large static payload loaded on startup. This increases the main bundle size and
initial parsing cost even though only a subset of recipes are needed early.

# Scope
- In:
  - Reduce initial bundle impact of recipe definitions (split, lazy load, or external data file).
  - Keep existing recipe APIs stable for callers (same lookup helpers).
  - Ensure gameplay behavior is unchanged once data is loaded.
  - Preserve offline/PWA behavior (data available without network).
- Out:
  - Gameplay balance changes.
  - Schema changes that require migration.

# Acceptance criteria
- Main bundle shows a measurable reduction in recipe payload size.
- Recipe lookups continue to work for all skills after data load.
- Build and tests pass.
 - Offline/PWA still works (recipes available without network).

# Priority
- Impact: Medium (startup perf).
- Urgency: Low (schedule alongside other perf work).

# Notes
- Derived from `logics/request/req_016_reduce_static_bundle_weight_recipes_payload_inline_svg_icons.md`.
- Candidate approaches: dynamic import per-skill (prefetched), JSON files loaded on demand and precached, or a compacted data format.
