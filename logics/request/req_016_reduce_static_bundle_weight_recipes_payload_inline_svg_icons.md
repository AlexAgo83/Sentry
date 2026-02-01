## req_016_reduce_static_bundle_weight_recipes_payload_inline_svg_icons - Reduce static bundle weight (recipes payload + inline SVG icons)
> From version: 0.8.18
> Understanding: 75%
> Confidence: 65%

# Needs
- Reduce the static bundle size driven by large recipe data and inline SVG icon payloads.
- Identify and implement a safer loading strategy for recipe definitions and icon assets.
- Keep runtime behavior unchanged while improving initial load performance.

# Context
- Bundle report highlights two heavy sources: `src/data/definitions/recipes` (static payload) and inline SVG in
  `src/app/ui/inventoryIcons.tsx` + `src/app/ui/skillIcons.tsx`.
- One acceptable solution is to externalize SVGs into separate files (sprite/assets) and load them at runtime.
- Any change should preserve existing icon usage APIs and recipe lookups, avoiding gameplay regressions.

# Backlog
- `logics/backlog/item_045_externalize_inline_svg_icon_payloads.md`
- `logics/backlog/item_046_reduce_recipes_payload_in_initial_bundle.md`
