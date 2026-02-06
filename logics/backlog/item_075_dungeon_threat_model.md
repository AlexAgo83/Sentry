## item_075_dungeon_threat_model - Dungeon threat model
> From version: 0.9.8
> Understanding: 95%
> Confidence: 93%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Enemy targeting feels artificial because it defaults to a deterministic but unnatural tie-break, reducing combat readability.

# Scope
- In:
- Threat tracking per floor wave (shared across enemies).
- Threat sources: damage dealt, healing (including potion auto-heal).
- Threat decay per step.
- Deterministic seeded tie-break order.
- Out:
- No UI overhaul.

# Decisions
- Threat scope is per floor wave (shared across enemies).
- Healing threat includes potion auto-heal.
- Decay rate: `THREAT_DECAY = 0.95` per step.

# Acceptance criteria
- Threat accumulates deterministically from damage and healing.
- Tie-break order is deterministic and stable per run.
- Replay determinism holds for same seed/state.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_023_dungeon_threat_based_targeting.md`.
