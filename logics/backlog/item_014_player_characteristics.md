## item_014_player_characteristics - Introduce player characteristics + modifiers
> From version: 0.8.0
> Understanding: 94%
> Confidence: 88%
> Progress: 0%

# Context
Players currently have no explicit characteristics. We want a stat system that supports base values plus permanent and temporary modifiers, and can drive action pacing, stamina, XP, and loot.

# Goal
Add a player characteristics model (base + mods) with clear stacking rules and initial gameplay impact.

# Needs
- Define 5 core stats (v1): Strength, Agility, Endurance, Intellect, Luck.
- Map stat effects:
  - Strength: reduce stamina cost for Combat/Hunting/Excavation/MetalWork.
  - Agility: reduce action interval (faster ticks).
  - Endurance: increase stamina max + stamina regen.
  - Intellect: increase skill + recipe XP gain for crafting skills (Cooking/Alchemy/Herbalism/Tailoring/Carpentry).
  - Luck: small bonus chance for extra/rare rewards.
  - Ensure every skill has a primary stat influence:
    - Combat, Hunting, Excavation, MetalWork -> Strength (stamina cost reduction).
    - Cooking, Alchemy, Herbalism, Tailoring, Carpentry -> Intellect (XP gain).
    - Fishing -> Luck (bonus reward chance).
- Modifiers support both flat and multiplier types.
- Effective stat formula: `(base + sum(flat)) * (1 + sum(mult))`, then clamp to min/max.
- Separate modifier pools:
  - Permanent: persistent upgrades (never expire).
  - Temporary: buffs/debuffs with `expiresAt` timestamps.
- Modifier data shape:
  - `id`, `stat`, `kind: "flat" | "mult"`, `value`, `source`, optional `expiresAt`, optional `stackKey`.
- Temporary modifier cleanup on tick (or when applying) to avoid stale buffs.
- Persist stats + modifiers in save state.
- Initial base values for new players (define defaults).
- Define stat gain model:
  - Base stats initialized at character creation (same baseline for all).
  - Permanent gains via milestones (level ups/quests/rare consumables only).
  - Temporary gains via buffs/events with duration in minutes.
  - No per-action stat leveling in v1.
- Recommend numeric defaults (v1):
  - Base stats: 5 each.
  - Scaling: +1 stat = +1% effect for its domain.
  - Caps: min 0, max 50 (soft cap later if needed).
  - Temporary buffs: same `stackKey` refreshes duration; different sources stack up to 3.
  - Permanent gains: +1 stat point every 5 total skill levels; rare consumables grant +2.
  - Luck: +0.5% bonus reward chance per point, capped at +25%.
  - Agility applies to all actions; Strength/Intellect apply only to mapped skills.
  - UI shows Effective (Base + Mods) with active temp mod chips + timers.

# Decisions
- Start with 5 stats; do not add secondary stats yet.
- Allow both flat and multiplier modifiers in v1 for flexibility.
- Use a single helper to compute effective stats for gameplay use.
- Clamp at a minimum of 0 and a reasonable max (define in constants).
- Temporary modifiers expire by timestamp (ms), not ticks.
- No failure system in v1; stats affect speed/cost/rewards only.
- Endurance only affects stamina max + regen (no stun reduction).
- Strength only affects stamina cost (no yield bonus yet).
- Use a single hard cap in v1 (50).
- UI shows totals plus Base/Perm/Temp breakdown on hover, and lists temp buffs with timers.
- Temporary buffs tick down in real time; expire on resume via `expiresAt` checks.
- Keep decimals internally; round only for display, and use `ceil` for stamina cost/interval.
- One modifier targets a single stat (no multi-stat modifiers in v1).
- Store permanent gains as permanent modifiers (not baked into base).
- Agility applies to all actions (global interval reduction).
- Luck affects rare table only (no quantity increase) in v1.
- Equipment modifiers stack with other modifiers using the same formula.
- Allow negative modifiers; clamp effective stats at 0.
- Apply stat effects to offline recap gains.
- Stamina regen scales only with time (not action state) in v1.
- Modifiers apply immediately on the next tick (no retroactive changes).
- Stats panel shows effective values; hover reveals Base/Perm/Temp breakdown (no toggle).
- Luck affects loot only in v1 (no crafting bonuses yet).
- Compute effective stats on demand per tick (no caching in v1).
- Use linear formulas:
  - Stamina cost: `ceil(baseCost * (1 - Strength * 0.01))`, min 1.
  - Action interval: `ceil(baseInterval * (1 - Agility * 0.01))`, min 500ms.
  - XP gain: `baseXp * (1 + Intellect * 0.01)`, round to 2 decimals for display.
- Show buff timers only on hover tooltip in v1.

# Scope (v1)
- Implement data model + calculations.
- Wire into action loop for stamina cost, action interval, and XP reward.
- Add Luck effect only to item reward roll (small % bonus).
- Ensure stats are used by equippable items (equipment modifiers apply to effective stats).
- Minimal UI: show current effective stats in the Stats panel, split into two columns (levels left, stats right) with hover breakdown.
- No equipment system yet; modifiers can come from actions/events.

# Acceptance
- Player state includes base stats, permanent mods, and temporary mods.
- Effective stats are derived consistently by the shared helper.
- Action interval/stamina cost/XP gain reflect stat effects.
- Temporary modifiers expire and are removed automatically.
- Basic UI displays effective stats in the Stats panel.
- Tests cover stat calculation + one effect per stat.

# Open questions
- Exact base values and scaling per stat (numbers TBD).
- Max cap values per stat.
- Which actions/events grant temporary modifiers first.
