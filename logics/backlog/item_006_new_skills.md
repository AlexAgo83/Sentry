## item_006_new_skills - New skills (alchemy, herbalism, tailoring, fishing, carpentry, leatherworking)
> From version: 0.4.0
> Understanding: 96%
> Confidence: 92%
> Progress: 0%

# Context
Introduce three new skills to expand the roster.

# Goal
Add alchemy, herbalism, tailoring, fishing, carpentry, and leatherworking as playable skills with recipes, items, and action loops.

# Needs
- Add new skills: Alchemy, Herbalism, Tailoring, Fishing, Carpentry, Leatherworking.
- Define recipes and action definitions for each skill.
- Define item production/consumption for each new skill.
- Ensure UI selection supports new skills and recipes.
- Ensure inventory/offline recap include new item deltas.
- Balance item inputs/outputs so recipes can depend on other recipes while keeping progression stable.
- Unlock recipes in tiers (every 10 levels to start).
- Rename existing recipe names to be more descriptive.

# Scope (v1)
- Keep recipes simple (2 per skill at tier 1).
- Base items only (no rarity/quality).
- No gold costs on recipes in v1 (items only).
- Tier 1 recipes are self-contained (no cross-skill costs).

# Defaults (proposal)
- Base items: `herbs`, `fish`, `cloth`, `leather`, `wood`, plus existing `meat`, `food`, `gold`.
- Offline recap shows per-player item totals (not per recipe).
- Recipe names stay in English for now.
- Use readable recipe IDs (e.g., `hunt_small_game` instead of `hunt001`).
- Add 1 new recipe per tier at levels 10/20/30.
- Reserve "heroic" recipes for tier 30 only.
- Actions follow existing loop cadence and stamina rules.

# Acceptance
- New skills appear in the loadout skill selector.
- Recipes are selectable and run correctly.
- Items produced/consumed show in inventory and offline recap.
- Save/load persists new skills and items.

# Open questions
- Final item list and recipes per skill (IDs, rates, and costs).

# Gameplay loop notes
- Keep at least one self-sustaining recipe per tier to avoid deadlocks.
- Add item sinks (crafting, upgrades, buffs) so inventories do not inflate indefinitely.
- Balance cross-skill dependencies so a solo path still exists per tier.
- Surface "next unlock" targets (tier goals) to keep progression readable.
