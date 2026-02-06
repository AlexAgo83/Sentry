## req_026_game_wiki - In-game wiki at /wiki
> From version: 0.9.9
> Understanding: 70%
> Confidence: 62%

# Needs
- Add an in-game wiki accessible at `/wiki`.
- Add a `Wiki` button in `Settings` that navigates to `/wiki`.

# Context
- Players need a quick reference for gameplay rules and systems without leaving the game.
- The wiki should be available from the Settings screen as an entry point.

# Goals
- Provide a lightweight, readable in-game wiki page.
- Keep navigation clear and consistent with existing UI patterns.

# Locked decisions (v1)
- Route: `/wiki`.
- Entry point: Settings screen button labeled `Wiki`.

# Scope detail (draft)
- UI:
  - Add a Settings row/button leading to `/wiki`.
  - Create a dedicated Wiki screen/page.
- Content:
  - Start with a static, curated set of sections (e.g. Combat, Dungeon, Items, Skills, Progression).
  - Keep the first version read-only.
- Navigation:
  - Provide a simple list of sections and anchors within the page.

# Technical references to update
- `src/app/routes`
- `src/app/components/Settings*`
- `src/app/screens` or `src/app/components` (new Wiki screen)
- `src/app/containers` (if needed for routing)

# Acceptance criteria
- Navigating to `/wiki` shows the wiki screen.
- Settings includes a `Wiki` button that opens `/wiki`.
- Wiki content is readable on desktop and mobile.

# Risks / open points
- What exact content and section list should ship in v1?
- Should the wiki be localized or only in English for now?
- Should it be searchable or just static sections?

# Backlog
- To be split after approval.
