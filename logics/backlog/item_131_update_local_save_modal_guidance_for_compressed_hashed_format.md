## item_131_update_local_save_modal_guidance_for_compressed_hashed_format - Update local save modal guidance for compressed hashed format
> From version: 0.9.28
> Understanding: 95%
> Confidence: 93%
> Progress: 100%
> Complexity: Low
> Theme: UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
UI helper text around local save import/export does not explicitly reflect the new compressed+hashed payload format and strict validation behavior.

# Scope
- In:
- Update local save modal helper copy to match v3 compressed+hashed behavior.
- Keep messaging concise and consistent with existing tone.
- Confirm invalid import UX still clearly indicates failure without exposing technical internals.
- Out:
- No additional feature logic beyond user-facing wording and clarity.

# Acceptance criteria
- Local save modal text is aligned with v3-only import/export behavior.
- User-facing flow remains simple (export, import, reset) with clear outcomes.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_042_local_save_import_export_compressed_and_hashed_payload.md`.
