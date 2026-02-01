## req_014_quests_screen - Quests screen with craft/skill milestones
> From version: 0.8.17
> Understanding: 90%
> Confidence: 85%

# Needs
- Add a **Quests** screen.
- **Desktop:** add a header button **after Shop**.
- **Mobile:** add a **Quests** entry inside the **Travel** menu.
- Reuse the **Shop** visual language for the screen and its cells.
- Seed quests:
  - **One quest per equipable item**: complete when the item has been crafted **10 times**.
  - **One quest per skill**: complete when the skill reaches **level 10**.
- Rewards: each quest grants **gold**.
- Completed quests are **non-repeatable** and **fade** in the list.
- Quests are **account-wide/shared across heroes** (not per-character).
- Quest system should be **extensible** to support future condition types (lore, exploration, collections, etc.).

# Goals
- Give players clear, collectible milestones without new complex systems.
- Keep the UI consistent with the Shop screen.
- Make completion state obvious without removing context.

# Scope detail (decisions)
- Quests are **static definitions** (data-driven) derived from:
  - Equipable items list.
  - Skills list.
- Completion conditions:
  - Craft count per item >= 10.
  - Skill level >= 10.
- Rewards are **gold only**.
- Completed quests are **visually faded** and remain visible.
- Quests are **not repeatable**.

# UX suggestions (best)
- Layout mirrors Shop:
  - Title + count (e.g., “Quests (12/24)”).  
  - List of quest cards similar to shop items (icon + title + description + reward).
- Card states:
  - **Active:** normal contrast.
  - **Completed:** 40–60% opacity + optional “Completed” badge.
- Small progress hint per quest (optional):
  - “Crafted 7/10” or “Lv 8/10”.

# UX copy (suggested)
- Screen title: “Quests”.
- Equipable quest title: “Craft {ItemName} x10”.
- Skill quest title: “Reach {SkillName} Lv 10”.
- Reward line: “Reward: {gold} gold”.
- Completed badge: “Completed”.

# Open questions
- Gold reward formula: flat per quest, scaled by tier, or by item/skill level?
- Should completed quests be sorted to bottom automatically?
- Do we show quest icons based on item/skill, or a generic quest icon?

# Out of scope (unless requested)
- Daily/weekly quests.
- Quest chains, story text, or NPCs.
- New currencies or items as rewards.
- Backend sync for quests.

# Context
Add context and constraints.

# Backlog
- `logics/backlog/item_035_quests_screen.md`
- `logics/backlog/item_052_quests_screen.md`
