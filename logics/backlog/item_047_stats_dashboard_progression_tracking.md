## item_047_stats_dashboard_progression_tracking - Stats dashboard progression tracking
> From version: 0.8.18
> Understanding: 94%
> Confidence: 92%
> Progress: 100%

# Problem
Players need a clearer Stats experience that highlights progression trends (XP/Gold), time spent (active vs idle), and top-used skills across the last 7 days, while still allowing access to detailed character stats (base + modifiers).

# Scope
- In:
  - Add 7‑day rolling tracking for XP and Gold (daily buckets, local midnight).
  - Track total active time (skill running) and idle time (no active skill) over the same window.
  - Track skills by active time over the 7‑day window (all skills).
  - Persist tracking data in the save payload (local + cloud) and retain only 7 days.
  - Redesign Stats into a progression dashboard (cards, split bar, top skills list, trend chart).
  - Add a separate “Hero statistics” view with base + modifiers breakdown (perm/temp/gear) and totals.
  - Support both Global progression and Hero progression views (default to Hero progression).
  - Hero virtual score is independent from global virtual score.
  - Mobile‑first layout with a distinct, stronger desktop layout (as per mockups).
- Out:
  - No external analytics or telemetry.
  - No new gameplay systems or skill categories beyond existing data.

# Acceptance criteria
- 7‑day rolling buckets exist for XP and Gold, updated with daily deltas (offline gains included).
- Active vs idle time is tracked and surfaced for the same 7‑day window.
- Top skills list reflects total active time and updates correctly (all skills, sorted).
- Stats UI matches the progression dashboard mockups (mobile + desktop) and defaults to Hero progression.
- Global/Hero progression switch works and persists.
- Hero statistics view displays base + perm/temp/gear modifiers with totals.
- Hero virtual score is independent from global score.
- Data persists in save payload and survives reloads; only last 7 days retained.

# Priority
- Impact: High (core clarity and player feedback loop).
- Urgency: Medium (important UX improvement, not blocking).

# Notes
- Source: `logics/request/req_017_stats_dashboard_progression_tracking.md`
- Mockups: `logics/external/mockup/` (progression + character, mobile + desktop).
- Delivered: global + hero progression tracking, hero stats view, chart clarity/legend, responsive buttons, per‑hero virtual score.

- Derived from `logics/request/req_017_stats_dashboard_progression_tracking.md`.
# Clarifications

- Define the primary outcome and scope boundaries (in/out). :: In: core deliverables. Out: adjacent features or polish.
- Define time window and granularity for any trends/rollups. :: Rolling 7-day window, daily buckets, local midnight.
- Define metric sources and what counts (include offline or background gains?). :: Use deltas, include offline/background gains if applicable.
- Define active vs inactive time rules (if relevant). :: Active = process/action running. Inactive = no active process.
- Define mobile vs desktop layout expectations. :: Mobile-first with condensed order; desktop uses a broader dashboard layout.
- Define persistence and retention. :: Persist in saved state; retain only the last 7 days of data.
- Define edge cases and empty states. :: No data -> zeros + empty state; new users -> seeded buckets.
- Define acceptance criteria with measurable checks. :: Acceptance: outputs match spec; UI matches mockups; data persists across reloads.
- Note dependencies and risks. :: Dependencies: data sources available; Risks: data drift, migration complexity.
