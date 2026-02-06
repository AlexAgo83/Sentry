## item_077_weapon_category_combat_effects - Weapon category combat effects
> From version: 0.9.9
> Understanding: 96%
> Confidence: 93%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Weapons are mostly stat-only and lack combat identity. The new weapon category effects need to be implemented in dungeon combat.

# Scope
- In:
- Apply category effects during dungeon combat:
  - Magic: heal ally on cooldown; wearer takes +10% damage received.
  - Ranged: 50% faster attacks; wearer takes +25% damage received.
  - Melee: +25% threat generation (damage-only); wearer takes -10% damage received.
- Deterministic heal targeting and cooldown tracking.
- Out:
- No revive or overheal.
- No non-deterministic randomness.

# Decisions
- Magic heal cooldown: `4000ms` per hero.
- Heal triggers only when an ally is below `70%` HP.
- Heal blocked while the wearer is KO or stunned.
- Target: lowest %HP ally (excluding self), deterministic tie-break by party order.
- Heal amount: 25% of target max HP (min 1), only if target missing HP.
- Damage received modifiers apply after Endurance mitigation.
- Ranged attack speed modifier applies only in dungeon combat and only to interval (not extra attacks).
- Melee threat bonus applies to damage only (not heals).

# Acceptance criteria
- Category effects are applied in dungeon combat as specified.
- Magic heals do not revive and do not overheal.
- Ranged attack speed modifier applies only in dungeon combat.
- Threat modifier applies only to damage events.
- Replay/offline determinism is preserved.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_024_weapon_rework_staff_bow_sword.md`.
