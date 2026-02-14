## item_129_update_local_export_flow_to_emit_v3_compressed_save_strings - Update local export flow to emit v3 compressed save strings
> From version: 0.9.28
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Local export currently emits uncompressed JSON envelope text, making manual copy/paste heavier than necessary.

# Scope
- In:
- Update local export path to always produce `schemaVersion: 3` envelope.
- Ensure exported text contains compressed payload and checksum.
- Preserve existing copy target behavior (clipboard first, prompt fallback).
- Keep save content semantics unchanged after round-trip.
- Out:
- No import parser behavior changes in this item.

# Acceptance criteria
- `Export save` generates v3 compressed+hashed text.
- Exported text can be copied/pasted as a single string in current UX flow.
- Export path does not regress existing local save modal interactions.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_042_local_save_import_export_compressed_and_hashed_payload.md`.
- Depends on `item_128`.
