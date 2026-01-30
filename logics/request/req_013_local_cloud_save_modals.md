## req_013_local_cloud_save_modals - Split Local/Cloud save modals
> From version: 0.8.14
> Understanding: 85%
> Confidence: 75%

# Needs
- Add two new modals: **Local Save** and **Cloud Save**.
- From the Setup/System modal, move all **local save** actions into Local Save.
- From the Setup/System modal, move all **cloud save** UI/actions into Cloud Save.
- Keep the Setup/System modal focused on telemetry and system controls only.

# Goals
- Clear separation of responsibilities: local vs cloud save flows.
- Preserve existing behaviors (export/import/reset, cloud status + sync + diff).
- Keep navigation lightweight (one click from Setup to the new modals).
- Improve clarity around save freshness and conflicts without adding new workflows.

# Scope detail (decisions)
- **Local Save modal** contains:
  - Export save.
  - Import save.
  - Reset save.
  - Any local-save warnings/confirmations already in place.
- **Cloud Save modal** contains:
  - Cloud status badge (Online/Offline/Warming).
  - Local vs Cloud diff (score/date/version).
  - Last sync + time-ago.
  - Upload/download/refresh actions.
- **Setup/System modal** keeps:
  - Telemetry list (tick/loop/drift details).
  - Links/buttons to open Local Save + Cloud Save modals.
  - Optional: surface last sync time-ago inline next to the Cloud Save entry.
  - Dev tools entry in dev builds (simulate lives there now).

# UX suggestions (best)
- Setup shows two primary buttons: “Local save” + “Cloud save” with a short helper line under each.
- Local Save groups low-risk actions (Export/Import) together; Reset is separated with a warning tone.
- Cloud Save layout: status + last sync at top → Local vs Cloud comparison card → actions row.
- If local/cloud diverge, show a subtle “Different” badge + one-line guidance (e.g., “Pick the newer save”).
- Offline state: show “Cloud unavailable” and disable upload/download; keep Refresh enabled.
- Keep button sizes/spacing consistent with existing modal actions; avoid new iconography unless reused.

# UX copy (suggested)
- Setup buttons: “Local save” / “Cloud save”.
- Local Save title: “Local save”.
- Cloud Save title: “Cloud save”.
- Helper line (Local): “Export, import, or reset this device’s save.”
- Helper line (Cloud): “Compare and sync with your cloud save.”
- Divergence hint: “Local and cloud saves differ.”

# Context
- System modal currently mixes telemetry, local save actions, and the cloud panel.
- Simulate offline has been moved into Dev Tools, so Setup should stay focused on telemetry + save navigation.
- Splitting these into dedicated modals should make save management clearer and reduce clutter.

# Open questions
- Should the Local Save modal also expose raw save copy utilities from Safe Mode (when available)?
- Should Cloud Save be accessible directly from the header for fast sync, or only via Setup?

# Out of scope (unless requested)
- Save schema changes.
- Backend API changes.
- New save conflict resolution flows.
