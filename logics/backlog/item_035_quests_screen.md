## item_035_quests_screen - Quests screen + milestone quests
> From version: 0.8.17
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Problem
Promoted from `logics/request/req_014_quests_screen.md`

# Scope
- In:
- Add a Quests screen.
- Desktop: add header button after Shop.
- Mobile: add Quests entry inside Travel menu.
- Reuse Shop layout and cell styling for quest cards.
- Seed quests:
  - One quest per equipable item (complete when crafted >= 10).
  - One quest per skill (complete when skill level >= 10).
- Rewards: grant gold per quest.
- Completed quests are non-repeatable and visually faded.
- Quests are shared across heroes (account-wide), not per-character.
- Quest system should be extensible to support future condition types (lore, exploration, collections, etc.).
- Out:
- Daily/weekly quests.
- Quest chains/story text/NPCs.
- New currencies or items as rewards.
- Backend sync for quests.

# Acceptance criteria
- A Quests screen exists and matches the Shop visual layout.
- Desktop header shows a Quests button after Shop.
- Mobile Travel menu contains a Quests entry.
- Quest list includes:
  - A quest for each equipable item with “crafted 10x” completion.
  - A quest for each skill with “reach level 10” completion.
- Each quest shows a gold reward.
- Completed quests are faded (remain visible) and do not repeat.
- Completed quests are listed after active ones.
- Progress text is shown for each quest (crafted 7/10, Lv 8/10).
- Quest progress/completion is shared across heroes.

# Priority
- Impact: Medium (long-term goals + retention).
- Urgency: Medium (new UX surface but no blockers).

# Decisions
- Rewards:
  - Skill quests: 100g at level 10 (flat).
  - Item craft quests: 50g + 10g * recipeLevel (fallback to 50g if level missing).
- Progress tracking:
  - Craft count uses successful crafts only.
  - If a save already meets the requirement, the quest is completed immediately.
- UI:
  - Two sections: Skill Quests and Craft Quests.
  - Completed quests are faded to ~55% opacity and kept visible at the bottom.
  - Show progress text on every quest card.
  - Quests are account-wide/shared between heroes.

# Data/implementation notes
- Quest definitions are static (data-driven), derived from the current skills list and equipable recipes.
- Use existing selectors for skill levels and craft counts; default to 0 if missing.
- No backend sync or persistence beyond current save state.
