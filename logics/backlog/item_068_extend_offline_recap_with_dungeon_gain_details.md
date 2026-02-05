## item_068_extend_offline_recap_with_dungeon_gain_details - Extend offline recap with dungeon gain details
> From version: 0.9.5
> Understanding: 95%
> Confidence: 91%
> Progress: 0%

# Problem
Offline recap currently emphasizes action-loop gains and does not clearly expose dungeon-derived gains per player, which hides combat progression performed while offline.

# Scope
- In:
  - Extend offline summary model with explicit dungeon gain fields per player.
  - Include at minimum Combat XP gains and dungeon item/gold deltas.
  - Merge action-loop and dungeon-loop gains in one recap payload without loss.
  - Render separate recap labels/sections for `Action gains` and `Dungeon gains`.
  - Keep recap compact and readable on mobile.
- Out:
  - New modal flows or separate recap screens.
  - Long-term historical analytics across multiple sessions.

# Decisions (v1)
- Add `dungeonGains` per player with `combatXp` and `itemDeltas` (gold + items).
- Render a single `Dungeon gains` line only when any dungeon delta is non-zero.
- Keep dungeon deltas folded into `totalItemDeltas`.
- Use a compact format: `Dungeon: +X Combat XP; +Y gold; +Z items`.

# Recommended defaults (v1)
- Add a `dungeonGains` payload per player with `combatXp` and `itemDeltas`.
- Render a single-line `Dungeon gains` row only when any dungeon delta is non-zero.
- Keep `totalItemDeltas` consistent by folding dungeon deltas into the existing aggregate.

# Open questions
- Should item deltas be summarized (gold + item count) or list key item types?
- Do we show dungeon gains even when action gains are zero, or only when dungeon gains exist?

# Acceptance criteria
- Offline recap shows dungeon-derived gains when dungeon progression occurred offline.
- Mixed sessions show both action and dungeon gains in the same recap cycle.
- Totals remain coherent with `totalItemDeltas` and per-player deltas.
- Recap readability is preserved on mobile widths.

# Priority
- Impact: High (offline visibility of core progression loop).
- Urgency: High (explicit request requirement).

# Notes
- Source request: `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`
- Derived from `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`.

