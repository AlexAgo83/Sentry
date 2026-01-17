## item_003_ts_rewrite - TypeScript + React remake (PWA-first)
> Targeted version: 1.0.0
> Understanding: 94%
> Confidence: 90%
> Progress: 0%

# Context
Full rewrite using TypeScript + React, keeping the current product features as reference
(skills, recipes, actions, offline processing, persistence, multi-player).

# Goal
Ship a modern, performant architecture with strong typing and a scalable UI layer.

# Needs
- New architecture (domain core + UI separation).
- Strongly typed data model (skills, recipes, actions, entities, loop).
- Persistence adapter with localStorage in v1, ready for cloud sync later.
- Offline handling aligned with tab visibility.
- PWA-first build and deployment path.
- Modern fantasy UI (full redesign allowed).
- Tests for core loop, persistence, and key gameplay flows.

# Suggested v1 Scope
- Must-have: multi-player, skills + recipes + actions loop, offline processing, save/load, basic economy (gold + stamina).
- Nice-to-have later: crafting expansions, deeper combat, inventory UI, analytics.

# Core Flow
Create player → select skill → select recipe → start action → offline catch-up → resume.

# Persistence Guidance
Use localStorage behind an adapter interface to allow future IndexedDB/cloud sync.

# Visual References (Optional)
Modern fantasy UI cues similar to Diablo IV menus, Hades UI, or Genshin character cards.

# Constraints
- React UI.
- TypeScript (no Rust in v1).
- Full feature parity with current app.
- LocalStorage for v1, cloud sync is not priority.

# Acceptance
- New app runs with feature parity and passes tests.
- Core engine is decoupled from UI.
- Clear path to add IndexedDB/cloud sync later.
