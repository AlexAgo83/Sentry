## item_054_dungeon_cta_entry_and_dedicated_screen_flow - Dungeon CTA entry and dedicated screen flow
> From version: 0.8.22
> Understanding: 97%
> Confidence: 93%
> Progress: 100%

# Problem
Dungeon mode needs a clear and consistent navigation entry point across desktop and mobile, with dedicated screen behavior (not modal).

# Scope
- In:
  - Add `Dungeon` CTA in desktop header before `Action`.
  - Add `Dungeon` CTA in mobile `ACT` list.
  - Apply distinct red-accent CTA variant for Dungeon entry.
  - Show an active-run state indicator on the Dungeon CTA when a dungeon run is in progress.
  - Open a dedicated dungeon flow screen on CTA click.
  - If a run is active, open the live dungeon screen directly.
- Out:
  - New global routing architecture changes unrelated to dungeon flow.
  - Additional CTA variants for other features.

# Acceptance criteria
- Desktop header order includes `Dungeon` before `Action`.
- Mobile ACT list includes `Dungeon` entry with matching label and red accent identity.
- Dungeon CTA shows an active-run visual state consistently on desktop and mobile while a run is live.
- CTA always opens dungeon screen context (setup or live active run), never modal.
- Locked/unlocked states follow roster gate rules.

# Priority
- Impact: High (core discoverability and entry to new feature).
- Urgency: High (required for player access).

# Notes
- Source request: `logics/request/req_018_group_idle_dungeon_combat_loop.md`
- Derived from `logics/request/req_018_group_idle_dungeon_combat_loop.md`.
