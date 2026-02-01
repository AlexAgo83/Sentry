## item_019_invocation_tablets_skill - Invocation Tablets skill
> From version: 0.8.10
> Understanding: 90%
> Confidence: 90%
> Progress: 100%

# Context
Introduce an Invocation-focused crafting skill that produces Invocation Tablets. Tablets are visible in inventory and can be equipped, but they have no gameplay effects yet.

Source request: `logics/request/req_007_invocation_tablets_skill.md`.

# Goal
Add a new skill and its tablet items so players can craft and equip Invocation Tablets, laying groundwork for later invocation mechanics.

# Needs
- Add a new skill definition and action loop for tablet crafting.
- Add at least one Invocation Tablet item (inventory + equipment definitions).
- Create a recipe that outputs tablets and consumes existing resources.
- Ensure tablets appear in inventory, can be equipped, and persist in saves.
- Provide inventory metadata (icon + short description) for tablets.
- Add skill icon + color for the new skill.

# Decisions (v1)
- Skill:
  - Id: `Invocation`, Name: "Invocation".
  - Base interval: 3500ms (aligned with other crafting skills).
  - Icon: new "rune tablet" glyph in `SkillIcon`.
  - Color: `#6f93ff` (arcane blue, distinct from existing skills).
- Tablet item:
  - Id: `invocation_tablet`, Name: "Invocation Tablet".
  - Equipment slot: `Amulet` (no new slot in v1).
  - Modifiers: none in v1 (no gameplay effects yet).
  - Inventory meta: icon `artifact`, description "Stone tablet etched with invocation sigils."
- Recipe:
  - 10 invocation recipes (Lv 1 → 80), each with a unique name + description.
  - Costs scale from `stone x6`, `crystal x1` up to `stone x24`, `crystal x10`, `artifact x2`.
  - Rewards scale from `invocation_tablet x1` up to `invocation_tablet x5`.
  - Duration follows the skill base interval.

# Scope (v1)
- In:
  - New skill + recipe + item definitions.
  - Inventory metadata + icon hookup.
  - Equipment compatibility for the tablet item.
  - Skill icon + color addition.
- Out:
  - Invocation gameplay effects.
  - New equipment slot types (Relic/Focus).
  - Multiple tablet tiers or rarities.

# Acceptance
- The new Invocation skill appears in the skill list and can be selected.
- Crafting the tablet recipe consumes stone/crystal and produces the tablet item.
- Invocation Tablet appears in inventory and can be equipped in the existing equipment UI.
- Save/load persists tablets and equipped state.

# Priority
- Impact: medium (new crafting loop + inventory/equipment content).
- Urgency: low (foundation for future invocation features).

# Notes
- Later extension: consider dedicated Relic/Focus slot and tablet tiers once invocation effects are defined.

- Derived from `logics/request/req_007_invocation_tablets_skill.md`.
# Problem
Describe the problem and user impact.

# Scope
- In:
- Out:

# Acceptance criteria
- Define acceptance criteria
