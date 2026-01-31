## item_035_quests_screen - Quests screen + milestone quests
> From version: 0.8.17
> Understanding: 90%
> Confidence: 85%
> Progress: 0%

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

# Priority
- Impact: Medium (long-term goals + retention).
- Urgency: Medium (new UX surface but no blockers).

# Notes
- Consider showing optional progress text (e.g., “7/10 crafted”, “Lv 8/10”).
- Define gold reward formula (flat vs scaled) before implementation.
- Decide if completed quests should be sorted to the bottom.
