## req_050_startup_login_prompt_when_backend_online_with_dismiss_option - Prompt login when backend is online, with user-dismissable option
> From version: 0.9.31
> Understanding: 94%
> Confidence: 88%
> Complexity: Medium
> Theme: UX / Cloud
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- When the backend is reachable (online) and the user is **not logged in**, prompt the user with a modal suggesting to log in.
- If the user accepts, route them directly to the login modal/flow (Cloud Save login).
- The user must be able to disable this prompt so they don’t see it again on future launches.

# Context
- Cloud Save requires auth but the game can be played locally without logging in.
- Users who forget to log in may lose cross-device sync benefits.
- Backend may be cold (warmup) or offline; we must not show confusing prompts when backend is unreachable.

# Goals
- Increase Cloud Save adoption without annoying users who intentionally never log in.
- Keep the prompt safe:
  - do not block gameplay,
  - do not spam repeatedly,
  - show only when backend is actually reachable.

# Non-goals
- Forced login or gating gameplay behind cloud auth.
- Showing this prompt while backend is offline/warming.
- Building a full onboarding wizard; this is a lightweight suggestion prompt only.

# Locked decisions (v1)
- The prompt is shown only when all are true:
  - backend is `online` (based on existing readiness probe / telemetry backend status),
  - user is not authenticated,
  - “don’t show again” is not enabled,
  - prompt has not already been shown in the current session.
- The prompt defaults to **enabled** for new users (unless explicitly opted out).
- User choices:
  - Primary: `Log in` (navigates to Cloud Save login modal/flow)
  - Secondary: `Not now` (dismiss for this session only)
  - Tertiary: `Don't ask again` (persistently disables future prompts)
- Persisted setting:
  - Recommended: persist in the save payload as a UI preference so it survives relaunch/export/import/cloud.
  - If persisting in save is not desirable, fallback to `localStorage` is acceptable but must be documented.

# UX copy (draft)
- Title: `Cloud Save`
- Body: `Log in to enable cloud backups and sync across devices.`
- Buttons:
  - `Log in`
  - `Not now`
  - `Don't ask again`

# Routing behavior
- On `Log in`:
  - close the prompt,
  - open the system/settings modal,
  - reroute to the Cloud Save modal directly on the login view (same as manual entrypoint).

# Warmup/offline behavior
- If backend is `warming` or `offline`:
  - do not show the prompt.
- If backend becomes `online` during the session:
  - show the prompt once (if user still not logged and prompt enabled).
- Do not treat warmup/network errors as a reason to show/clear login-related state.

# Scope detail (draft)
- Add a persisted preference flag:
  - `cloudLoginPrompt: { enabled: boolean }` (name TBD), default true
  - plus a runtime-only `hasShownThisSession` boolean
- Implement prompt trigger logic in a central place (recommended):
  - app container or modal orchestrator that already observes backend status + auth status.
- Add/adjust UI components:
  - a new simple modal (“login suggestion”)
  - wiring to open Cloud Save login modal

# Technical references to update (expected)
- `src/app/AppContainer.tsx` (or the modal container used for system overlays)
- `src/app/hooks/useCloudSave.ts` (auth state + backend state)
- `src/app/components/CloudSaveModal.tsx` (ensure it can be opened directly in login view)
- `src/core/types.ts` / `src/core/state.ts` / `src/core/serialization.ts` (if persisting preference in save)
- `src/adapters/persistence/saveMigrations.ts` (normalize new preference field)
- `tests/app/*` (modal trigger + routing tests)

# Acceptance criteria
- When backend is online and user not logged in, the login prompt appears once per session (unless disabled).
- Clicking `Log in` routes to the Cloud Save login modal.
- Clicking `Not now` dismisses for the current session only.
- Clicking `Don't ask again` disables it persistently.
- No prompt appears when backend is offline/warming.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - UI test for prompt show/hide rules
  - UI test for “don’t ask again” persistence

# Risks / open points
- Persisting UI preferences in cloud-synced saves may surprise some users (prompt disabled on one device disables on all devices). If undesired, keep it device-local.
- Prompt timing should avoid interrupting first-frame gameplay; consider delaying until after initial render.

# Backlog
- Backlog items should be generated next (preference persistence, modal, routing wiring, tests).

