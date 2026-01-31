## item_045_externalize_inline_svg_icon_payloads - Externalize inline SVG icon payloads
> From version: 0.8.18
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Problem
Bundle report shows large inline SVG payloads (notably `inventoryIcons.tsx` and `skillIcons.tsx`) baked into the main JS.
This inflates initial download and parse time even when many icons are not immediately needed.

# Scope
- In:
  - Move large inline SVG sets to external assets (SVG per file).
  - Preserve existing icon APIs in UI components (minimal call‑site churn).
  - Ensure icons still render correctly across panels (inventory, skills, actions).
  - Keep offline/PWA support intact (icons available without network).
- Out:
  - Redesigning icon artwork.
  - Changing icon semantics or IDs.

# Acceptance criteria
- Main bundle no longer includes large inline SVG sets.
- UI renders the same icons as before (visual parity).
- Build passes and bundle report shows reduced icon footprint.
 - Offline/PWA still works (icons available without network).

# Priority
- Impact: Medium (startup perf).
- Urgency: Low (can be scheduled with other perf work).

# Notes
- Derived from `logics/request/req_016_reduce_static_bundle_weight_recipes_payload_inline_svg_icons.md`.
- Candidate approaches: SVG files in `public/` (precached) or imported assets with runtime lookup.
