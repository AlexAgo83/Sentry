## item_174_req053_dungeon_replay_log_semantic_control_cleanup - req053 dungeon replay log semantic control cleanup
> From version: 0.9.36
> Understanding: 93%
> Confidence: 88%
> Progress: 0%
> Complexity: Low
> Theme: Accessibility / Dungeon UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The dungeon replay log currently uses a non-native interactive element (`role="button"` on a text node) for seek actions. This is less robust than native controls and increases accessibility risk for keyboard and assistive technologies.

# Scope
- In:
- Replace non-native replay log interaction element with semantic button controls.
- Keep existing replay seek behavior unchanged (click + keyboard activation).
- Preserve current layout and visual style.
- Verify no behavior regressions in replay cursor updates.
- Out:
- Replay rendering/performance changes.
- Broader dungeon screen refactors.

# Acceptance criteria
- Replay log interactive entries are implemented with native semantic controls.
- Keyboard activation works consistently without custom role fallback.
- Replay seek behavior remains unchanged for end users.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_053_accessibility_compliance_hardening_for_dialogs_tabs_and_keyboard_flows.md`.
- Likely touch point:
  - `src/app/components/dungeonScreen/components/DungeonReplayView.tsx`
