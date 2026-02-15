## item_170_req050_login_prompt_modal_trigger_and_routing_to_cloud_login - Add startup login prompt modal and route to Cloud Save login flow
> From version: 0.9.31
> Understanding: 92%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: UX / Cloud
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
When backend is online and user is logged out, we want a non-blocking prompt to encourage login, with a clean route into the existing Cloud Save login UI.

# Scope
- In:
- Create a lightweight modal with:
  - `Log in` (primary)
  - `Not now` (dismiss for session)
  - `Don't ask again` (persist preference)
- Trigger rules:
  - backend is online
  - user is not authenticated
  - prompt enabled (preference)
  - not already shown this session
- Routing:
  - on `Log in`, open Settings/System flow and navigate directly to Cloud Save login view.
- Warmup/offline handling:
  - do not show while backend is warming/offline
  - if backend becomes online later in session, show once (if still logged out and enabled)
- Out:
- No forced login or gameplay gating.

# Acceptance criteria
- Prompt appears only when conditions are met and at most once per session.
- Buttons behave as specified and routing lands on the Cloud Save login view.
- No prompt appears while backend is warming/offline.

# Implementation notes
- Likely touch points:
  - `src/app/AppContainer.tsx` (or modal orchestrator)
  - `src/app/hooks/useCloudSave.ts` (auth/backend status)
  - `src/app/components/CloudSaveModal.tsx`

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_050_startup_login_prompt_when_backend_online_with_dismiss_option.md`.
