## req_020_combat_system_improvements_stats_and_offline_recap - Combat visibility + attack cadence improvements
> From version: 0.9.5
> Understanding: 98%
> Confidence: 94%

# Needs
- Improve combat system readability for players, especially around combat progression and effective combat power.
- Add attack speed / attack cooldown mechanics in dungeon combat, with attack cadence sensitive to Agility.
- In the character `Stats` screen, display the `Combat` level in a dedicated block under the existing stats panel.
- The Combat block must show a clear breakdown:
  - base value
  - modifiers (gear/buffs/other active effects)
  - any extra context fields if available
  - final total
- Dungeon gains must appear in the offline recap flow, aligned with how other skills are summarized.

# Goals
- Make combat progression explicit and understandable without opening dungeon screens.
- Make attack rhythm less static by replacing the fixed global cadence with per-entity attack cooldown logic.
- Reduce confusion between raw values and effective combat values.
- Ensure offline players always see dungeon-derived progression (especially Combat XP and dungeon item deltas).

# Locked decisions (v1)
- `Combat` remains a dungeon progression skill (not an Action selection skill).
- Attack cadence uses cooldowns between attacks (not pure "one full team attack every 500ms").
- Hero attack cooldown is affected by Agility via a clamped formula (`min/max` bounds required).
- v1 applies Agility-based attack speed to heroes first; enemy cadence can remain fixed unless explicitly balanced later.
- Use diminishing returns for Agility-to-speed conversion to avoid runaway late-game attack rates.
- Run per-entity cooldown resolution with multi-proc support (`while cooldown <= 0`) for large offline deltas.
- Add a per-tick safety cap on attacks per hero to protect performance and replay payload size.
- Add a per-tick global event cap to prevent replay/event spikes during large catch-up batches.
- Targeting priority stays deterministic (lowest HP, then stable tie-break) and must be explicitly documented in combat rules.
- Retarget fairness rule is explicit: v1 keeps current deterministic behavior (retarget after hero phase, not mid-chain per hero hit).
- Combat visibility is added in `Stats` as an extra dedicated section, not mixed into unrelated attribute rows.
- Offline recap must include dungeon-derived gains in the same recap session, not in a separate modal.
- If both action-loop and dungeon-loop gains exist for a player, recap must show both without data loss.

# Scope detail (draft)
- Character stats UI:
  - Add a `Combat` sub-panel under current stats content.
  - Present a compact “base + modifiers + total” formula style.
  - Expose at least:
    - `Combat Lv`
    - `Attack cadence` (`attack speed` or `attack cooldown`)
    - `Attacks / sec`
    - `Damage` (`base + modifiers + total`)
  - Include attack cadence visibility (`attack speed` or `attack cooldown`) in the Combat section.
  - Reuse current panel visual language and spacing rules.
- Dungeon combat runtime:
  - Introduce per-hero attack cooldown state.
  - Decrease cooldowns each simulation step and trigger attacks only when cooldown reaches zero.
  - On attack, reset cooldown using Agility-influenced interval formula with clamps and diminishing returns.
  - During offline catch-up and large deltas, allow multiple attacks in one tick when cooldown underflows.
  - Apply a hard safety limit (max attacks per hero per tick) to keep runtime stable.
  - Apply a global per-tick event cap to keep replay/event payload bounded in extreme offline cases.
  - Keep replay events deterministic and compatible with existing log truncation safeguards.
- Replay data:
  - Persist cadence snapshot fields needed for debugging/tuning consistency:
    - `baseAttackMs`
    - `agilityAtRunStart` (or equivalent source value)
    - `resolvedAttackIntervalMs`
- Combat data exposure:
  - Expose the values needed to render the Combat breakdown from runtime/domain state.
  - Keep formula source-of-truth in core combat/dungeon logic (UI reads only computed values).
- Offline recap:
  - Extend offline summary model to include dungeon progression per player (at minimum Combat XP + relevant item deltas).
  - Ensure recap build pipeline merges dungeon gains and action gains consistently.
  - Render a compact dungeon line per player (example: `Dungeon: +X Combat XP · +Y items/gold`).
  - Separate recap sections/labels for `Action gains` vs `Dungeon gains` to avoid source ambiguity.
  - Update recap rendering copy/labels so dungeon gains are understandable at a glance.

# Technical references to update
- `src/app/components/CharacterStatsPanel.tsx`
- `src/app/components/OfflineSummaryModal.tsx`
- `src/core/types.ts`
- `src/core/runtime.ts`
- `src/core/loop.ts`
- `src/core/dungeon.ts`
- Related containers/selectors feeding Character Stats and Offline Summary

# Recommended balance defaults (v1)
- Attack interval formula (hero):
  - `attackIntervalMs = clamp(250, 1400, round(baseAttackMs / (1 + Agility * 0.02)))`
  - keep `baseAttackMs` data-driven per archetype/system defaults.
- Offline/tick safety:
  - Allow multi-proc attacks with cooldown underflow handling.
  - Safety cap: `max 3 attacks / hero / simulation step` (tunable constant).
- Enemy cadence:
  - Keep fixed in v1 for balance control; revisit after first tuning pass.

# Tests & QA
- Unit:
  - Combat breakdown values are computed/rendered correctly (base/modifiers/total).
  - Agility changes attack cooldown/attack count as expected within configured clamp bounds.
  - Multi-proc cooldown path works correctly when `deltaMs` is large.
  - Safety cap prevents unbounded attack loops in one step.
  - Offline summary model includes dungeon gains when dungeon progression occurred offline.
- Integration:
  - Same party with higher Agility resolves encounters faster than lower Agility baseline.
  - Combat panel shows both cooldown and attacks/sec values in a coherent formula breakdown.
  - Offline catch-up with active dungeon run shows Combat XP/item gains in recap modal.
  - Mixed session (action + dungeon gains) renders both sources correctly per player.
- Regression:
  - Dungeon replay remains deterministic with cooldown-based attack cadence.
  - No change in Action selection behavior (`Combat` still hidden from Action list).
  - No duplication or loss in total item delta aggregation.

# QA matrix (tuning pass)
- Run a reference matrix with at least 3 Agility bands (`low`, `mid`, `high`) on the same seed/scenario.
- Track and compare:
  - floor clear time (TTK proxy)
  - survival rate / wipe rate
  - Combat XP/hour
  - gold/items per hour
- Use results to validate cadence balance and prevent economy inflation from speed scaling.

# Acceptance criteria (quantified)
- With identical seed/party/equipment, increasing Agility must reduce mean floor clear time (reference sample run set).
- Replay determinism remains true (`same seed + same initial state => same event sequence`).
- Offline recap displays dungeon-derived gains when dungeon progression occurred, including Combat XP attribution.
- Combat panel in Stats shows breakdown rows with non-empty values for base/modifiers/total.

# Risks / open points
- Potential mismatch between displayed “total combat” and actual damage formula if not sourced consistently.
- Balance risk: Agility scaling can heavily alter dungeon difficulty/reward rates if interval clamps are too loose.
- More attacks can increase replay event volume and truncation frequency if not tuned.
- Increased cadence may inflate effective rewards/hour unless explicitly validated in the tuning matrix.
- Offline recap density/readability on mobile if too many gain lines are added.
- Need to decide final wording for dungeon recap labels (`Dungeon`, `Combat`, `Run gains`, etc.).

# Backlog
- `logics/backlog/item_066_add_agility_based_attack_cadence_runtime.md`
- `logics/backlog/item_067_add_combat_breakdown_panel_in_character_stats.md`
- `logics/backlog/item_068_extend_offline_recap_with_dungeon_gain_details.md`
- `logics/backlog/item_069_harden_replay_observability_and_event_guardrails_for_cadence.md`
- `logics/backlog/item_070_update_tests_and_tuning_matrix_for_combat_cadence.md`
