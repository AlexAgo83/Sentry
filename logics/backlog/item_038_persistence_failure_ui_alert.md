## item_038_persistence_failure_ui_alert - Surface persistence failures to the user
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 100%

# Problem
Promoted from `logics/request/req_015_technical_review.md`.
The runtime disables persistence after repeated failures without any user‑visible warning, risking silent data loss.

# Scope
- In:
  - Show a non‑blocking persistent banner when persistence is disabled.
  - Provide a retry action and automatic re‑enable with backoff.
  - Track persistence error state in store for UI display.
  - Offer an “Export save” quick action while in failure state.
  - Add tests for the failure → warning → recovery path.
- Out:
  - Complex troubleshooting UI.

# Acceptance criteria
- When persistence is disabled, the UI shows a clear warning.
- A retry action attempts to re‑enable persistence.
- Warning clears on first successful persistence after failure.
- Tests cover both failure and recovery flows.

# Priority
- Impact: High (prevents silent data loss).
- Urgency: Medium.

# Notes
- Keep the warning subtle but persistent until recovery.
