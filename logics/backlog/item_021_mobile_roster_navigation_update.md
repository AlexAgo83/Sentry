## item_021_mobile_roster_navigation_update - Mobile roster navigation update
> From version: 0.8.11
> Understanding: 95%
> Confidence: 92%
> Progress: 100%

# Problem
Mobile navigation should emphasize the roster, but the button is labeled "Stats" and the roster panel can appear outside the intended screen. This is confusing and inconsistent.

# Scope
- In:
  - Mobile only: rename the "Stats" button to "Roster".
  - Mobile only: roster panel is visible only when the Stats/Roster screen is active.
  - Use the existing mobile breakpoint (`max-width: 720px`).
  - Keep the existing icon (no icon changes).
  - Update label in accessibility text/tooltips where "Stats" is exposed.
  - Keep desktop behavior unchanged.
- Out:
  - No change to the content of other panels.
  - No additional copy changes beyond "Stats" -> "Roster".
  - No localization changes in v1 (English label only).

# Acceptance criteria
- On mobile, the navigation label reads "Roster" at the 720px breakpoint and below.
- On mobile, the roster panel is hidden outside the Stats/Roster screen.
- Desktop labels and panel visibility remain unchanged.
- Basic UI regression test or visual check added for mobile navigation.

# Priority
- Impact: Medium (mobile UX clarity).
- Urgency: Medium.

# Notes
- Source: req_009_offline_roster_tablets.
- Entry point is the existing bottom action bar `SidePanelSwitcher`.
