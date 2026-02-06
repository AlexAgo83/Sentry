## item_076_dungeon_taunt_targeting_rules - Dungeon taunt + targeting rules
> From version: 0.9.8
> Understanding: 88%
> Confidence: 86%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Threat alone does not guarantee readable targeting. We need explicit taunt and stickiness rules, especially for bosses.

# Scope
- In:
- Taunt support with duration and threat bonus.
- Stickiness thresholds (normal vs boss).
- Boss always respects taunt.
- Target selection logic based on threat + stickiness.
- Out:
- No non-deterministic randomness.

# Acceptance criteria
- Taunt forces target selection for its duration.
- Bosses retain targets more often than normal enemies under the same threat spread.
- Targeting no longer always selects the first party member.
- Replay determinism holds for same seed/state.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_023_dungeon_threat_based_targeting.md`.
