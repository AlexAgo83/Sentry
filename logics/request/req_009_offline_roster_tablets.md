## req_009_offline_roster_tablets - Offline roster & tablets updates
> From version: X.X.X
> Understanding: 70%
> Confidence: 55%

# Needs
- Increase the offline time limit to 7 days.
- Mobile only: rename the "Stats" button to "Roster".
- Mobile only: the roster panel must be visible only within the Stats screen (not elsewhere).
- Add an inventory equipment slot for tablets and allow tablets to be equipped.
- Limit tablet equipment to a single tablet in that slot (no multi-equip).
- Add tablet charges: each tablet starts with 100 charges; each player action while a tablet is equipped consumes 1 charge; when charges reach 0, the tablet disappears.
- Show remaining charges on the tablet item info and in the equipment UI.

# Context
- Adjust mobile navigation and information layout so the roster is accessed via the Stats screen.
- Keep non-mobile behavior unchanged unless explicitly required.
- Tablets require a dedicated equipment slot and charge tracking that is visible to players.

# Constraints / decisions
- Scope is limited to mobile UI copy and panel visibility, plus the offline time limit change.
- Tablet equipment is restricted to a single item in its slot; charges decrement per player action while equipped.

# Open questions
- Which existing offline time limit is being replaced (current value and where it's enforced)?
- Confirm the exact mobile entry point for the Stats/Roster screen to avoid breaking navigation.
- Should the roster panel be entirely hidden outside Stats, or just collapsed/inactive?
- Define which actions count as "player actions" for charge consumption (any action, only specific actions, or only when online?).
