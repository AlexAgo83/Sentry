## item_031_new_badges_for_menus_and_items - “New” badges
> From version: 0.8.13
> Understanding: 80%
> Confidence: 70%
> Progress: 0%

# Context
Players miss newly unlocked items/menus without a visual cue.

# Goal
Add “New” badges to surface new content.

# Scope (v1)
- Badge on menus/tabs when new items become available.
- Badge on items in inventory when first seen.
- Store “seen” state in localStorage, namespaced by app version.

# Acceptance
- Badges appear when new content is introduced.
- Opening the menu/item clears the badge.
- Badges reset on new app version.
