## item_030_cloud_last_sync_and_meta_diff - Cloud last sync + visual diff
> From version: 0.8.13
> Understanding: 85%
> Confidence: 75%
> Progress: 100%

# Context
Cloud panel shows Local/Cloud meta lines but lacks “last sync” and an at-a-glance diff.

# Goal
Make cloud state easier to compare and understand.

# Scope (v1)
- Track last successful sync time (refresh or upload).
- Display “Last sync: time-ago” with fallback “Never”.
- Add visual diff for local vs cloud: highlight newer date and higher score.

# Acceptance
- Last sync updates on successful refresh/upload.
- Time-ago formatting is readable (m/h/d).
- Diff highlights the better/newer values clearly.
