## item_004_project_review_followups - Review follow-ups (legacy + SW cache)
> From version: 0.3.0
> Understanding: 92%
> Confidence: 88%
> Progress: 100%

# Context
Records the full-project review findings and the agreed follow-ups.

# Findings summary
- Medium: runtime visibility handler is never removed on restart; can double-run offline catch-up.
- Medium: offline catch-up work is O(ticks) and may freeze the UI after long gaps.
- Medium: service worker cache strategy can serve stale assets after deploys.
- Low: `-webkit-appearence` typo prevents intended progress styling in WebKit.
- Low: legacy ESM import without `.js` extension can break in native ESM contexts.
- Low: missing tests for offline recap, reset flow, and UI actions.

# Decisions
- Remove the legacy JS implementation.
- Adopt a versioned service-worker cache strategy with cleanup.

# Actions (applied)
- Removed legacy JS folders/files under `src/`.
- Registered the service worker with a versioned URL and updated cache naming/cleanup in `public/sw.js`.

# Problem
Describe the problem and user impact.

# Scope
- In:
- Out:

# Acceptance criteria
- Define acceptance criteria

# Priority
- Impact:
- Urgency:

# Notes
