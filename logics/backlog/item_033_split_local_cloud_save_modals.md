## item_033_split_local_cloud_save_modals - Split Local/Cloud save modals
> From version: 0.8.14
> Understanding: 90%
> Confidence: 85%
> Progress: 100%

# Problem
Promoted from `logics/request/req_013_local_cloud_save_modals.md`

# Scope
- In:
- Add two new modals: Local Save and Cloud Save.
- Move local save actions (export/import/reset) out of Setup into Local Save.
- Move cloud save panel/actions out of Setup into Cloud Save.
- Keep Setup focused on telemetry + navigation to the two save modals (and Dev tools in dev builds).
- Preserve current behaviors and copy where possible.
- Out:
- Save schema changes.
- Backend API changes.
- New conflict resolution flows beyond existing compare/sync actions.

# Acceptance criteria
- Setup modal shows telemetry plus two buttons: “Local save” and “Cloud save” (Dev tools only in dev builds).
- Setup modal no longer shows local save actions or the cloud panel.
- Local Save modal exposes Export, Import, Reset with existing confirmations/warnings.
- Cloud Save modal shows status badge, last sync time-ago, local vs cloud comparison (score/date/version), and sync actions (refresh/upload/download) with existing enable/disable states.
- Cloud actions remain disabled when offline (refresh remains available).
- Visual diff remains clear (newer/higher highlighted) and does not regress current layout alignment.
- No regression in save behavior: export/import/reset and cloud sync continue to work as before.

# Priority
- Impact: Medium (clarifies critical save flows, reduces Setup clutter).
- Urgency: Medium (quality-of-life improvement; no functional blocker).

# Notes
- UX suggestions:
  - Setup stays a thin hub: telemetry + two primary buttons; optional last sync helper under Cloud Save.
  - Local Save groups Export/Import together and isolates Reset with a warning tone.
  - Cloud Save layout: status + last sync at top → Local vs Cloud comparison card → actions row.
  - When local/cloud differ, show a subtle “Different” badge + one-line guidance (no new conflict flow).
  - Offline state: show “Cloud unavailable”; disable upload/download; keep refresh enabled.
  - Keep spacing/typography consistent with existing modal actions.
  - Ensure button labels are short and action-focused (avoid new iconography unless reused).
  - Preserve existing keyboard/escape-close behavior of ModalShell.
