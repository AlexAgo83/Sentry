## item_059_dungeon_persistence_offline_catch_up_and_latest_run_replay - Dungeon persistence offline catch-up and latest run replay
> From version: 0.8.22
> Understanding: 94%
> Confidence: 88%
> Progress: 70%

# Problem
Dungeon runs must persist safely across reloads/cloud sync and remain coherent with offline catch-up while preserving latest run replay data.

# Scope
- In:
  - Persist dungeon run state in save payload (local + cloud compatible).
  - Apply offline catch-up with existing global cap and deterministic simulation rules.
  - Persist latest run replay snapshot (team, equipment, start consumables, seed, timeline).
  - Keep only latest run replay in storage.
  - Enforce replay storage cap (5000 events or 2 MB serialized), with fallback to critical-event timeline when cap is exceeded.
  - In save conflicts with active runs, default to newest save while surfacing explicit run-active warning in conflict UI.
  - Route to dungeon live screen by default when run remains active after resume/catch-up.
- Out:
  - Multi-run replay archive and long-term run history browser.
  - Backend analytics pipelines.

# Acceptance criteria
- Active run resumes correctly after reload and offline intervals.
- Offline catch-up outcomes match online simulation rules and stop on wipe/end.
- Latest replay can be opened manually and reproduces final run timeline deterministically.
- Save payload size remains controlled with latest-run-only replay retention.
- Replay cap and fallback behavior prevent oversized save payloads.
- Conflict UI clearly signals active-run impact when newest save is chosen.

# Priority
- Impact: High (offline-first reliability and trust).
- Urgency: High (critical for idle game consistency).

# Notes
- Source request: `logics/request/req_018_group_idle_dungeon_combat_loop.md`
- Derived from `logics/request/req_018_group_idle_dungeon_combat_loop.md`.
