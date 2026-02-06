## task_071_dungeon_completion_counter_state - Persist completion counts
> From version: 0.9.9
> Owner: —
> Status: Ready
> Understanding: 90%
> Confidence: 84%
> Progress: 0%

# Summary
Add and persist a per-dungeon completion counter that increments on victory only.

# Dependencies
- item_085_dungeon_completion_counter_state

# Steps
1. Add a `completionCounts` map keyed by dungeon ID to persisted state.
2. Increment count on victory run end in dungeon runtime.
3. Add save migration for the new state field.
4. Update any selectors/tests referencing dungeon state.

# Decisions
- Victory is `status === "victory"`.
- Increment on `run_end` for victory only (avoid double increment).

# Acceptance criteria
- Counter increments exactly once per victory run.
- Counter persists across reloads.
- Replay does not increment the counter.
