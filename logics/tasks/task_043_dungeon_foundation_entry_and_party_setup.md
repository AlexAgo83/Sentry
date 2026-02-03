## task_043_dungeon_foundation_entry_and_party_setup - Dungeon foundation entry and party setup
> From version: 0.8.22
> Understanding: 95%
> Confidence: 91%
> Progress: 0%

# Context
Derived from:
- `logics/backlog/item_053_dungeon_onboarding_roster_gate_and_fourth_hero_naming.md`
- `logics/backlog/item_054_dungeon_cta_entry_and_dedicated_screen_flow.md`
- `logics/backlog/item_055_dungeon_party_setup_and_run_preparation.md`

This task delivers the player entry funnel before combat simulation: onboarding gate, Dungeon CTA integration (desktop + mobile), and setup flow with a 4-hero party requirement.

# Plan
- [ ] 1. Onboarding gate: generate 3 starter heroes with English non-duplicate names and enforce 4th hero naming before dungeon access.
- [ ] 2. Navigation: add `Dungeon` CTA before `Action` on desktop and under `ACT` on mobile with red-accent visual identity.
- [ ] 3. CTA states: implement locked tooltip (<4 heroes), unlocked state, and active-run indicator.
- [ ] 4. Screen flow: route CTA to dedicated dungeon screen (setup or live if run is active).
- [ ] 5. Party setup: enforce exactly 4 heroes, validate availability, and keep preparation tied to already equipped gear only.
- [ ] 6. Add/adjust tests for onboarding gate, CTA visibility/state, and setup validation paths.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
