## item_167_req049_autosync_triggers_rate_limits_and_warmup_backoff_integration - Add rate-limited auto-save triggers and robust warmup/offline retry behavior
> From version: 0.9.31
> Understanding: 90%
> Confidence: 80%
> Progress: 0%
> Complexity: High
> Theme: Reliability / Performance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Auto-sync can easily become noisy (hammering the backend) or flaky (warmup timeouts, offline transitions). We need sensible triggers, debouncing, and retry/backoff.

# Scope
- In:
- Implement auto-save triggers (behind auto-sync toggle):
  - on visibility hidden (best-effort)
  - interval while visible (rate-limited, ex: 30s)
  - after significant events (manual import/export/load/reset, dungeon end, etc.) with debounce
- Ensure auto-save runs only when local changed since last successful sync.
- Apply per-attempt timeouts + exponential backoff + jitter on warmup/offline failures.
- Provide a manual `Retry now` action when in warming/offline status.
- Out:
- No background sync APIs (service worker background sync).

# Acceptance criteria
- Auto-save attempts are rate-limited and do not spam the backend.
- Warmup/offline failures back off and recover later without user logout.
- UX exposes a clear status and a manual retry.

# Implementation notes
- Likely touch points:
  - `src/app/hooks/useCloudSave.ts` (or autosync module)
  - `src/app/api/cloudClient.ts` (timeouts)
  - telemetry panel if it already shows backend status (optional)

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_049_cloud_auto_sync_autoload_with_conflict_resolution_and_warmup_handling.md`.

