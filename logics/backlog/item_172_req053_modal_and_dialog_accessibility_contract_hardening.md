## item_172_req053_modal_and_dialog_accessibility_contract_hardening - req053 modal and dialog accessibility contract hardening
> From version: 0.9.36
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Accessibility / UI Infrastructure
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app uses dialog semantics in several places (system modals, startup splash, mobile roster drawer) but lacks a complete dialog accessibility contract:
- inconsistent accessible naming,
- missing focus lifecycle handling (initial focus, trap, restore),
- partial modal semantics in the mobile drawer.
This can degrade keyboard and screen-reader usability and cause regressions across all modal-based flows.

# Scope
- In:
- Add `lang` metadata at document root (`index.html`) as a baseline accessibility requirement.
- Harden shared modal contract in `ModalShell`:
  - explicit accessible naming linkage (`aria-labelledby` and/or `aria-label`),
  - initial focus on open,
  - focus trap while open,
  - focus restore on close.
- Align startup splash and roster drawer behavior with accessible dialog semantics.
- Keep behavior and visuals stable while improving semantics/keyboard handling.
- Out:
- Full visual redesign of modal screens.
- Non-dialog components (tabs/replay controls) covered in separate backlog items.

# Acceptance criteria
- `<html>` exposes a valid language attribute.
- Shared modal shell exposes a clear accessible name and robust keyboard focus behavior.
- Mobile roster drawer dialog behavior is keyboard/screen-reader consistent.
- Existing modal flows remain functionally unchanged for users.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_053_accessibility_compliance_hardening_for_dialogs_tabs_and_keyboard_flows.md`.
- Likely touch points:
  - `index.html`
  - `src/app/components/ModalShell.tsx`
  - `src/app/components/StartupSplashScreen.tsx`
  - `src/app/AppView.tsx`

# Delivery
- Added document language metadata in `index.html` with `<html lang="en">`.
- Hardened shared modal contract in `src/app/components/ModalShell.tsx`:
  - moved dialog role semantics to modal container,
  - linked title via `aria-labelledby`,
  - added focus lifecycle (initial focus + tab trap + focus restore).
- Added reusable focus management hook in `src/app/hooks/useDialogFocusManagement.ts`.
- Applied dialog semantics and focus management to `src/app/components/StartupSplashScreen.tsx`:
  - `aria-labelledby` + `aria-describedby`,
  - initial focus on Continue when available.
- Hardened mobile roster drawer dialog in `src/app/AppView.tsx`:
  - `role="dialog"` + `aria-modal` + `aria-labelledby`,
  - initial focus + trap + restore,
  - added explicit in-drawer close button and Escape close handling.
- Styled new drawer header/close affordance in `styles/global.css`.
