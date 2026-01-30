## req_011_economy_action_inventory_cloud_qol - Economy caps + action/inventory/cloud QoL
> From version: 0.8.13
> Understanding: 92%
> Confidence: 88%

# Goals (best suggestions)
## Economy / Shop
- Keep roster cap at 20 and make the cap state explicit (disabled buy + “Maxed” label + short warning line).
- Use compact number formatting for large values everywhere the player reads gold or counts, with full values on tooltip/aria.
- In Shop, show “Next: …” costs inline + tooltip with full values.

## Action
- Keep bonus lines visible (Speed bonus, XP bonus) and add tooltips explaining formulas:
  - Agility: “Agility reduces action time by 1% per point.”
  - Intellect: “Intellect increases XP by 1% per point (intellect skills only).”
- Show “Stun time” as a separate line when stamina <= 0 (Action panel + selection summary).

## Inventory
- Add “Sell all” button when an item is selected (except gold). Confirmation required; show estimated gain (unit value × count).
- Show unit value (gold/item) in item focus panel.
- Apply compact formatting to Count, Sell gain, and slider quantities; full values via tooltip.

## Cloud
- Add “last sync” with time-ago (e.g., 2m / 3h / 2d), updated on successful refresh/upload; fallback “Never”.
- Add visual diff between Local vs Cloud meta (score/date/version), highlighting newer date and higher score.
- Keep status badge (Online / Offline / Warming) in header.

## Badges
- Add “New” badge on menus/items when new elements appear; store state in localStorage per app version + menu key.

## Tech / perf
- Memoize expensive selectors and use shallow equality for store hooks.
- Split heavy panels into memoized subcomponents where it reduces re-renders.

# Scope detail (decisions)
- Compact formatting threshold: >= 1,000.
- Compact format: K/M/B/T with dynamic decimals (1–2) depending on magnitude.
- Full format: locale string with separators in tooltip/aria.
- “Sell all” sells entire stack for the selected item only.
- Stun time line shows only when stamina <= 0.
- Intellect bonus line only for intellect skills.

# UX copy (suggested)
- Cap reached: “Roster cap reached.”
- Sell all confirm: “Sell all {ItemName}? You’ll gain ≈ {Gain}g.”
- Unit value: “Unit value: {Value}g”
- Last sync: “Last sync: {time-ago}” / “Last sync: Never”

# Context
- Shop and Action already have bonus labels and formatted values; we are standardizing and expanding usage.
- Inventory sell flow is the most common spot for huge numbers.
- Cloud already shows local vs cloud meta lines; diff + last sync are additive.

# Out of scope (unless requested)
- Backend changes.
- Save schema changes.
