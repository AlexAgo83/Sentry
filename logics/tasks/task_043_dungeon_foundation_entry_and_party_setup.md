## task_043_dungeon_foundation_entry_and_party_setup - Dungeon foundation entry and party setup
> From version: 0.8.22
> Understanding: 95%
> Confidence: 91%
> Progress: 100%

# Context
Derived from:
- `logics/backlog/item_053_dungeon_onboarding_roster_gate_and_fourth_hero_naming.md`
- `logics/backlog/item_054_dungeon_cta_entry_and_dedicated_screen_flow.md`
- `logics/backlog/item_055_dungeon_party_setup_and_run_preparation.md`

This task delivers the player entry funnel before combat simulation: onboarding gate, Dungeon CTA integration (desktop + mobile), and setup flow with a 4-hero party requirement.

# Plan
- [x] 1. Onboarding gate: generate 3 starter heroes with English non-duplicate names only when roster is empty, and enforce 4th hero naming before dungeon access.
- [x] 2. Navigation: add `Dungeon` CTA before `Action` on desktop and under `ACT` on mobile with red-accent visual identity.
- [x] 3. CTA states: implement locked tooltip (<4 heroes), unlocked state, and active-run indicator.
- [x] 4. Screen flow: route CTA to dedicated dungeon screen (setup or live if run is active).
- [x] 5. Party setup: enforce exactly 4 heroes, validate availability, and keep preparation tied to already equipped gear only.
- [x] 6. Add/adjust tests for onboarding gate, CTA visibility/state, and setup validation paths.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Completed in code: onboarding gate + 3 starter heroes generation (empty roster only), Dungeon CTA integration desktop/mobile, dedicated dungeon screen routing, setup validation for 4-hero party, and related test updates.
