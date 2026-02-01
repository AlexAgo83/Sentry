## req_017_stats_dashboard_progression_tracking - Stats dashboard progression tracking
> From version: 0.8.18
> Understanding: 92%
> Confidence: 90%

# Needs
- Track XP and gold progression for the last 7 days (rolling window) so the Stats screen can show a clear trend.
- Track total execution time spent running skills and total idle time (no action) for the same window.
- Redesign the Stats panel into a progression dashboard (cards + compact trends) aligned with the provided PNG style.
- In the Activity area, show the 5 most-used skills (by total execution time) for the selected window.
- Add a separate "Character Stats" tab that lists base stats with a detailed modifiers breakdown (perm/temp/gear) and the resulting total.

# Context
- Current Stats panel (`src/app/components/CharacterStatsPanel.tsx`) focuses on skill levels and attribute modifiers; there is no time-series tracking for XP/gold or time spent.
- The new dashboard should prioritize progression signals (daily XP/gold, trends, totals) over the full skill list.
- Data must persist in the save payload (local + cloud) and survive reloads.

# Constraints / notes
- Keep the tracking lightweight (simple rolling window, no external analytics).
- The 7‑day view is required; other ranges can be optional if they come “for free.”
- Avoid inventing gameplay concepts not present yet (e.g., “Combat/Explore” labels if the game doesn’t expose them).
- PWA + mobile-first: the dashboard must read well on phones, but still have a strong desktop layout (can differ if needed).
- Suggested defaults (unless product decides otherwise):
  - Rolling window: 7 daily buckets, midnight local time, include today.
  - XP/Gold: track daily deltas (gains), include offline gains.
  - Active time: time with a skill running; Idle time: no skill running.
  - Top 5 skills: by total active time within the 7-day window.
  - Tabs: “Progression” (default) and “Character”, remember last tab locally.
