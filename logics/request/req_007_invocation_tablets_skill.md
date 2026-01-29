## req_007_invocation_tablets_skill - New skill to craft Invocation Tablets
> From version: 0.8.10
> Understanding: 85%
> Confidence: 75%

# Needs
- Add a new skill (action) dedicated to crafting **Invocation Tablets** (tablettes d'invocation).
- Invocation Tablets are inventory items:
  - visible in the inventory UI,
  - eligible for equipment (equippable item).
- Scope for now is limited to **creating the skill and the tablet items only** (no invocation effects yet).

# Context
- This request introduces the first step of an invocation system by adding a craftable tablet item.
- Gameplay effects / usage of tablets will be handled in a later request.

# Constraints / decisions
- Use existing inventory item rules (stacking, persistence, UI visibility).
- The new skill should behave like other crafting/production skills (start/stop, recipe-driven output).
- No new combat/summoning mechanics in this v1.

# Open questions
- What recipe(s) and inputs are required to craft tablets?
- Output quantities, craft duration, and unlock level for the skill/recipes?
- What equipment slot/type should the tablets use?
- Item naming, icon, and rarity/quality (if any)?
