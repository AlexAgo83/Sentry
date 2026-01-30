## item_020_offline_catch_up_cap_to_7_days - Offline catch-up cap to 7 days
> From version: 0.8.11
> Understanding: 96%
> Confidence: 92%
> Progress: 100%

# Problem
Players who stay offline longer than 12 hours lose progress because the runtime only processes 12h of catch-up. We need a longer cap (7 days) while keeping the capped recap messaging.

# Scope
- In:
  - Increase offline catch-up cap to 7 days across all platforms.
  - Make the cap configurable via a single constant (e.g., `OFFLINE_CAP_DAYS`, default 7) and derive max offline catch-up ms from it.
  - Allow an optional dev-only override via env (e.g., `VITE_OFFLINE_CAP_DAYS`) with the constant as fallback.
  - Preserve and surface capped recap messaging (away vs processed) when the cap is hit.
  - Update or add tests for the new cap.
- Out:
  - No change to offline interval/threshold behavior.
  - No redesign of the offline recap UI beyond existing capped messaging.
  - No new time formatting (keep current hour/min formatting for long durations).

# Acceptance criteria
- When away duration exceeds the configured cap (default 7 days), only the capped duration is processed and the recap indicates it was capped.
- When away duration is below the cap, behavior is unchanged.
- Cap applies on all platforms (desktop, mobile, PWA).
- Tests cover the 7-day default and the capped recap messaging.

# Priority
- Impact: High (offline progression feels broken for long absences today).
- Urgency: Medium (gameplay quality, not a blocker).

# Notes
- Source: req_009_offline_roster_tablets.
- Current cap is 12h in `src/core/runtime.ts` (`MAX_OFFLINE_CATCH_UP_MS`).
