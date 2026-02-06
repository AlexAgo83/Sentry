## req_023_dungeon_threat_based_targeting - Dungeon threat-based targeting
> From version: 0.9.8
> Understanding: 95%
> Confidence: 92%

# Needs
- Replace the current “lowest HP then first hero” targeting with a more natural, readable enemy targeting model.
- Keep deterministic outcomes for replay and offline catch-up.
- Support healer aggro, boss stickiness, and explicit taunt.

# Context
- Current targeting behavior feels artificial because it repeatedly selects the same party slot.
- Dungeon combat is deterministic and simulation-first, so targeting changes must preserve replay/offline determinism.
- This request intentionally changes combat rules (unlike `req_022_dungeon_gameplay_logic_optimizations`).

# Goals
- Make enemy targeting feel responsive to party actions (damage, healing, taunt).
- Reduce target jitter while avoiding the “always first hero” pattern.
- Provide clear, tunable constants for balance.

# Locked decisions (v1)
- Deterministic targeting is mandatory (seeded tie-breaks only).
- Healing generates threat (including potion auto-heal).
- Bosses keep a stickier target than normal enemies and always respect taunt.
- Taunt is supported in v1 with a simple, explicit source (item or hero flag).
- Threat resets on floor start (per wave scope only).
- No boss threat multipliers in v1.
- Threat does not reset on boss phase or summons in v1.

# Scope detail (draft)
- Threat model (per floor wave):
  - Maintain `threatByHeroId` for the current enemy wave (not per enemy).
  - On hero damage dealt: `threat += damage * 1.0`.
  - On hero healing: `threat += heal * 0.6`.
  - On taunt: `threat += TAUNT_THREAT_BONUS` and set `tauntUntilMs` for that hero.
  - Each simulation step, apply decay: `threat *= THREAT_DECAY`.
- Target selection:
  - If any hero has active taunt, target the taunter with highest taunt bonus (deterministic tie-break).
  - Otherwise, keep current target if alive and within stickiness threshold of top threat.
    - Normal enemy stickiness: 10% of top threat.
    - Boss stickiness: 15% of top threat.
  - If not sticky, select highest threat hero.
  - Tie-break using deterministic order derived from run seed and party IDs.
- Determinism:
  - All tie-breaks must use a seeded order stored in run state.
  - No runtime randomness.

# Recommended constants (v1)
- `THREAT_DECAY = 0.95` per step
- `HEAL_THREAT_RATIO = 0.6`
- `TAUNT_THREAT_BONUS = 200`
- `TAUNT_DURATION_MS = 2500`
- `STICKY_THRESHOLD_NORMAL = 0.10`
- `STICKY_THRESHOLD_BOSS = 0.15`

# Technical references to update
- `src/core/types.ts`
- `src/core/dungeon.ts`
- `src/app/components/dungeon/arenaPlayback.ts` (only if new events are needed for UI)

# Acceptance criteria
- Enemy targeting no longer always selects the first party member under identical conditions.
- Damage- and heal-driven threat changes target selection in predictable ways.
- Bosses retain targets more often than normal enemies under the same threat spread.
- Taunt reliably forces target selection for its duration.
- Replay determinism holds for same seed and initial state.

# Risks / open points
- Threat parameters can significantly alter dungeon difficulty and should be tuned with a small matrix.
- Taunt duration/bonus must be balanced to avoid trivializing bosses.

# Backlog
- (none yet)
