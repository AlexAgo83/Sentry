## req_030_recent_action_journal - Add a simple journal of the last 10 actions
> From version: 0.9.10
> Understanding: 64%
> Confidence: 58%

# Needs
- Keep a simple journal of the last 10 actions for readability and debugging.
- Make the journal visible in the UI.

# Context
- Players want to understand what just happened, especially after offline progress.
- The journal helps debugging action selection, dungeon loops, and state transitions.

# Goals
- Capture the latest 10 action events with minimal overhead.
- Display them in a compact, readable list.
- Keep the feature low-risk and easy to remove or extend.

# Locked decisions (v1)
- Store only the last 10 entries (rolling window).
- Entries are human-readable (short label + timestamp or relative time).
- The journal is intended for readability and debugging.

# Scope detail (draft)
- Data:
  - Add a small ring buffer for action events in state.
  - Include events such as action start, action change, dungeon start/end, offline catch-up summary.
- UI:
  - Add a compact panel or section that lists the last 10 entries.
  - Keep it visible without requiring deep navigation (location to decide).
- Formatting:
  - Each entry: time + short description.
  - Use consistent typography with other info lists.

# Technical references to update
- `src/core/runtime.ts` or action dispatcher (capture events)
- `src/core/types.ts` (state shape)
- `src/adapters/persistence/saveMigrations.ts` (if persisted)
- `src/app/components` (journal display)
- `src/app/styles` (journal styling)

# Acceptance criteria
- The last 10 actions are captured and displayed.
- The list updates in real time and after offline catch-up.
- No noticeable performance impact.

# Risks / open points
- Should the journal persist across reloads or be session-only?
- Where to place the journal in the UI (Settings, System, Action screen, or new panel)?
- Exact event list to include in v1.

# Backlog
- To be split after approval.
