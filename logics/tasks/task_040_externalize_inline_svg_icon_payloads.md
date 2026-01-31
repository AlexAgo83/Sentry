## task_040_externalize_inline_svg_icon_payloads - Externalize inline SVG icon payloads
> From version: 0.8.18
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_045_externalize_inline_svg_icon_payloads.md`

# Plan
- [ ] 1. Audit icon usage and map IDs → file paths (inventory/skills).
- [ ] 2. Export SVGs to per-file assets and add a runtime resolver that preserves the current API.
- [ ] 3. Update UI icon rendering to use external files (fallback/alt + sizing parity).
- [ ] 4. Ensure offline/PWA precache includes icon assets (no network dependency).
- [ ] 5. Verify bundle report reduction and spot-check panels (inventory, skills, action selection).
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run test:ci
- npm run build
- npm run bundle:check

# Report
