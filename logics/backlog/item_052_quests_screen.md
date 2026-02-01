## item_052_quests_screen - Quests Screen with Craft/Skill Milestones
> From version: 0.8.17
> Understanding: 90%
> Confidence: 85%
> Progress: 100%

# Summary
Formalizes the request to add a Quests screen with craft/skill milestones as described in `req_014_quests_screen`.

# Needs
- Add a Quests screen (desktop: header button after Shop; mobile: entry in Travel menu).
- Seed quests: one per equipable item (crafted 10x), one per skill (level 10).
- Rewards: gold. Completed quests fade in the list.
- Quests are account-wide and extensible for future types.

# Context
- See request: `logics/request/req_014_quests_screen.md`

# Tasks
- [x] Implement Quests screen (UI + logic)
- [x] Seed quests from items/skills
- [x] Add quest completion/reward logic

# Source
- Source request: `logics/request/req_014_quests_screen.md`
