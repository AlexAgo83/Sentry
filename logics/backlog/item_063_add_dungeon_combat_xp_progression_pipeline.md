## item_063_add_dungeon_combat_xp_progression_pipeline - Add dungeon combat XP progression pipeline
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Problem
Dungeon gameplay currently uses `Combat` level for scaling but does not consistently grant `Combat` XP as a first-class progression loop, reducing clarity and long-term progression payoff.

# Scope
- In:
  - Add dungeon Combat XP grants at milestone events (batched updates only).
  - Implement v1 formula:
    - `floorXp = 6 + (tier * 3) + floor`
    - `bossBonusXp = floorXp * 2` (last floor only)
  - Grant XP to all party members participating in the run.
  - Keep dungeon power scaling based on `player.skills.Combat.level`.
  - Ensure offline dungeon progression applies the same Combat XP logic.
- Out:
  - Per-hit XP grants.
  - Full-balance overhaul of all skill curves.

# Acceptance criteria
- Floor clear grants `floorXp` to each party member.
- Final floor boss grants `bossBonusXp` in addition to floor clear XP.
- Combat XP writes happen on milestone events only (no per-hit save churn).
- Existing dungeon scaling behavior remains tied to Combat level with no regression.

# Priority
- Impact: High (core reward loop in dungeon mode).
- Urgency: High (primary functional goal of req_019).

# Notes
- Source request: `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`
- Derived from `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`.
- Delivered in dungeon runtime with floor/boss milestone XP grants and coverage tests.
