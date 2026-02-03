## req_018_group_idle_dungeon_combat_loop - Group idle dungeon combat loop
> From version: 0.8.22
> Understanding: 99%
> Confidence: 95%

# Needs
- Add a new gameplay loop based on **party-based idle dungeon combat**.
- Keep existing `Combat` gameplay as a **roaming loop**; do not reinterpret or replace it with party combat.
- Use the existing avatar preview visual language for 2D combat entities: head + face + hair + helmet (if equipped and visible).
- Add onboarding dependency for party size:
  - Start a new game with 3 procedurally generated heroes (including procedural names).
  - Require creation of the 4th hero by the player, with mandatory saved name input.
- Add a dedicated dungeon entry CTA in navigation:
  - Desktop: place before the `Action` CTA in header.
  - Mobile: add as a new action under `ACT` list.
  - CTA visual style must use a more red accent than other actions for quick differentiation.
  - CTA opens the dedicated dungeon flow screen.
- Use a clear flow: choose dungeon -> create party -> prepare loadout -> start idle run.
- Let players build a group from their roster and launch dungeon runs that auto-resolve over time.
- In v1, party size is **4 heroes**; system design must remain extensible for future larger formats (e.g., 10+ raid groups).
- Target system evolution must support multiple parties running in parallel across different dungeons.
- Add a pre-run preparation phase for equipment and carried resources/consumables at group level.
- Introduce floor/wave progression with clear outcomes: victory, defeat, and run interruption.
- Dungeon runs should take time, resolve in idle mode, and repeat in loop while completion conditions are met.
- Each dungeon includes at least one boss in v1 (multi-boss support planned later).
- Add meaningful rewards (gold/xp/loot progression) tied to dungeon completion and depth reached.
- Keep the loop compatible with offline catch-up and existing save/cloud sync flows.
- Support offline dungeon progression: simulate elapsed time on resume with deterministic catch-up rules.
- Keep the system extensible for future dungeon variants, affixes, bosses, and difficulty tiers.
- Build the combat as a **simulation-first idle system** so it can later drive a top-down 2D dungeon render (movement + attacks) without changing core rules.

# Goals
- Create a second long-term progression pillar next to craft/action loops.
- Increase roster value by making multiple heroes relevant in one activity.
- Preserve the idle-first identity: low input frequency, high readability, deterministic outcomes.
- Prepare a clean evolution path toward visual battle playback in a future top-down 2D view.

# Locked decisions (v1)
- Naming:
  - Rename the current player-facing skill label from `Combat` to `Roaming` (if any legacy UI still shows `Combat`).
  - Keep internal IDs/keys stable for compatibility unless a dedicated migration is planned.
- Dungeon entry is available once the roster has 4 heroes (onboarding flow above).
- Dungeon CTA visibility:
  - CTA stays visible even when roster < 4, but remains locked with an explanatory tooltip.
  - Dungeon flow becomes playable once roster has 4 heroes.
- Hero assignment is exclusive: a hero in dungeon cannot run any other activity at the same time.
- Multi-party scope:
  - v1 runs one active party at a time.
  - Data model and runtime design must stay compatible with future multi-party concurrent runs (different dungeons).
- Party death model:
  - Heroes can die in dungeon.
  - If all 4 heroes are dead, run ends immediately (full stop, no checkpoint retry).
  - Heroes recover when the party exits the dungeon (manual revive systems can be added later).
- Consumables/resources:
  - Meat is consumed during dungeon activity.
  - Healing is supported through potions; add healing potion recipes under `Alchemy`.
- Run behavior:
  - Launch with 5 dungeons in v1.
  - Initial dungeon set and order:
    - D1 `Ruines humides`
    - D2 `Cryptes d'os`
    - D3 `Forges brisees`
    - D4 `Sanctuaire noir`
    - D5 `Citadelle rouge`
  - Dungeon floor count is configurable per dungeon; default is 10 floors in v1.
  - One final boss in v1.
  - Auto-restart is enabled by default after successful completion, only if party is alive and required resources are available.
  - Auto-restart delay is fixed to 3 seconds.
  - Boss kill clears the run immediately.
- Offline handling:
  - Use the same offline cap as the current global system.
- Rewards:
  - Gold-only in v1, granted on boss kill only (mob rewards later).
- Observability:
  - Combat log is required in v1.
  - Keep only the latest run log in storage.
  - Latest run replay is available primarily to inspect failed runs.
  - Latest run replay snapshot must include team, equipment, start inventory for consumables, seed, and timeline events.
- Rendering model:
  - v1 combat render target is a simple arena model (no pathfinding).
  - Unit visuals use avatar head layers from existing preview system (face/hair/helmet visibility rules reused).
- Navigation entry:
  - CTA label is `Dungeon`.
  - Add a distinct red-accent Dungeon CTA before `Action` on desktop header.
  - Add the same Dungeon CTA in mobile `ACT` action list.
  - CTA opens the dedicated dungeon flow screen (not a modal).
  - If a dungeon run is already active, CTA opens the live run screen directly.
- Offline resume behavior:
  - If a dungeon run is active after catch-up resolution, opening the app routes users to Dungeon live screen by default.

# Scope detail (draft)
- New entry point: Dungeon screen + launch flow from main UI.
- Navigation and CTA rules:
  - Desktop header order includes Dungeon CTA before `Action`.
  - Mobile `ACT` menu includes Dungeon CTA as a new action row.
  - Dungeon CTA uses a red-accent style variant distinct from standard action buttons.
  - Triggering CTA routes user to the dungeon flow screen.
- System boundary:
  - Existing `Combat` skill/recipes remain the roaming activity.
  - Party dungeon combat is introduced as a separate system and progression track.
- Onboarding dependency:
  - Generate 3 starter heroes procedurally (including names).
  - Force creation and naming of the 4th hero before dungeon party setup is available.
- Flow (v1):
  - Step 1: Select a dungeon.
  - Step 2: Build a party of exactly 4 heroes from the roster.
  - Step 3: Configure preparation (equipment + carried items/resources).
  - Step 4: Launch the idle dungeon run.
- Party composition:
  - Validate eligibility (alive/available/not already assigned).
  - Keep party slot architecture scalable to support 10+ unit raids in future versions.
  - Keep party/run structures scalable for multiple concurrent parties in future versions.
- Dungeon run lifecycle:
  - Start run -> resolve combat in ticks -> checkpoint per floor/wave -> boss encounter -> end state.
  - Provide 5 dungeons in the initial v1 set.
  - Default run structure is 10 floors; floor count stays data-driven per dungeon.
  - Auto-restart after successful completion (loop).
  - One final boss encounter per run in v1.
  - Offline catch-up: when returning to the app, resolve elapsed time through the same simulation layer and apply outcomes/rewards consistently.
- Combat resolution:
  - Auto-battle only (no real-time manual actions in v1).
  - Run combat through a headless simulation layer (engine-authoritative, UI as consumer).
  - Both heroes and enemies have health points.
  - Both heroes and enemies deal and receive damage over time.
  - Party stats, equipment, and progression modify damage/survivability.
  - Enemy scaling increases by floor/depth.
  - Expose simulation events/state needed for future rendering (at least: entity state, attack events, damage events, deaths, floor transitions).
- Resource and recovery rules:
  - Consume meat while running dungeons.
  - At 0 meat, the dungeon run stops immediately (party considered dead for this run).
  - Allow healing via consumable potions (from `Alchemy`) during run resolution.
  - Potion usage is auto-use when hero HP is below 50%.
  - Potion usage is not capped per floor; it is limited by inventory stock and per-hero cooldown.
- Activity lock rules:
  - Heroes assigned to a dungeon party are unavailable for other action/roaming loops until run exit.
- Rewards and progression:
  - Gold rewards only in v1.
  - Rewards are granted on boss clear only (no mob gold rewards in v1).
  - Persist run summary for recap and future stats dashboards.
- Combat log:
  - Store a compact, readable combat log (damage, deaths, boss clear, run end reason) for in-session view and recap.
  - Persist only the latest run log in storage.
  - Provide replay support for the latest run, with priority on failure review.
  - Live simulation view remains the primary way to observe ongoing dungeon combat.
  - Replay entry is manual in v1 (button in dungeon screen); a dedicated failed-run screen can be added later.
- Failure handling:
  - Heroes can die in dungeon combat (v1 scope: dungeon death only).
  - If all 4 heroes are dead, the dungeon run stops immediately (wipe condition).
  - Full stop on wipe (no retry from checkpoint in v1).
  - Heroes recover when the party leaves the dungeon.
  - During offline catch-up, wipe/end conditions must stop further dungeon looping for the elapsed window.

# UX suggestions (best)
- Add a dedicated panel with 3 clear zones:
  - Party setup (slots + quick power preview).
  - Dungeon card (difficulty, expected rewards, recommended power).
  - Run status (current floor, enemies left, time, projected reward).
- During runs, show concise readable combat telemetry only (no noisy logs by default).
- Reuse current visual language from Action/Shop panels for consistency.
- Distinct entry affordance:
  - Desktop Dungeon CTA appears before `Action` and uses a red-accent variant.
  - Mobile Dungeon CTA appears in `ACT` list with the same red-accent identity.

# Visual rendering recommendations (live + replay)
- Visual direction:
  - Use a hybrid style: clean tactical readability with lightweight fantasy VFX accents.
  - Prioritize clarity over effects density, especially on mobile screens.
- Arena and camera:
  - Top-down fixed arena view in v1 (already aligned with "no pathfinding").
  - Light auto-zoom framing based on alive entities.
- Combat readability overlays:
  - Persistent HP bars for all units.
  - Target/focus indicator for active attacks.
  - Floating numbers for damage/heal, compact and short-lived.
  - Clear death marker and boss phase marker.
- Live controls:
  - Support `x1`, `x2`, `x4`, pause/resume.
  - Add quick "Focus Boss" control.
- Replay controls:
  - Replay latest run log with timeline scrub.
  - Add "Skip to first death" and "Skip to wipe/end" shortcuts.
  - Keep replay deterministic by consuming simulation timestamps/events only.
- Rendering architecture:
  - Simulation engine remains source of truth; renderer is a pure event consumer.
  - Minimum event stream for rendering: `spawn`, `attack`, `damage`, `heal`, `death`, `floor_start`, `boss_start`, `run_end`.
- Performance guardrails:
  - Object pooling for entities/floating texts.
  - Particle budget caps and low-FX fallback mode.
  - Keep 60 FPS target desktop / stable mobile frame pacing as baseline objective.

# Context
- Current gameplay mainly relies on single active skill/action loops.
- `Combat` already exists but currently maps to roaming progression, not group dungeon fights.
- There is no dedicated party-vs-enemy dungeon loop yet.
- The project already supports runtime ticks, offline catch-up, and save persistence; dungeon combat should build on these systems.
- This request should become the source for one or more backlog items (engine rules, UI flow, balancing, QA coverage).

# Constraints / notes
- Keep v1 lightweight: no multiplayer, no synchronous combat UI, no complex story dependencies.
- Maintain backward compatibility: current roaming `Combat` behavior and balance should stay unchanged in v1.
- Avoid high-frequency state churn that could inflate save payloads or hurt mobile performance.
- Prefer deterministic RNG behavior where possible to keep outcomes testable/reproducible.
- Keep simulation and rendering decoupled: future 2D visuals must not become the source of truth for combat outcomes.
- Respect existing offline safety limits/caps to avoid runaway simulation and oversized reward bursts.
- Ensure offline progression rules are capped/safe, aligned with existing catch-up safeguards.
- Define empty/error states: no eligible party, wiped team, interrupted run, outdated save migration.
- Keep combat log payload compact to avoid save bloat (especially with offline auto-restart loops).

# Recommended balance defaults (v1)
- Meat consumption (per floor, data-driven by dungeon tier):
  - `meatCostPerFloor = 1 + floor((dungeonTier - 1) / 2)` where tier is 1..5.
  - Per-floor defaults: D1=1, D2=1, D3=2, D4=2, D5=3.
  - Boss floor surcharge: `+1 meat` on floor 10.
  - Example totals for 10 floors: D1=11, D2=11, D3=21, D4=21, D5=31.
- Healing potions:
  - Auto-use trigger: hero HP `< 50%`.
  - Heal amount: `40%` of max HP (capped to max HP).
  - Cooldown: `8s` per hero between potion uses.
  - Default use priority when available: `tonic` -> `elixir` -> `potion`.
- Enemy scaling curves:
  - Mob HP per floor `f` (1..9): `mobHp = round(120 * 1.18^(dungeonTier - 1) * 1.10^(f - 1))`.
  - Mob damage per floor `f` (1..9): `mobDmg = round(12 * 1.15^(dungeonTier - 1) * 1.07^(f - 1))`.
  - Boss floor (floor 10): `bossHp = mobHp_floor10 * 5`, `bossDmg = mobDmg_floor10 * 1.8`.
- Boss mechanics (v1, one signature per dungeon):
  - D1 burst frontal attack.
  - D2 periodic poison pulse.
  - D3 temporary shield phase.
  - D4 add summon wave.
  - D5 enrage below 30% HP.

# Open questions
- Final tuning pass on the recommended defaults after first playable tests.

# Backlog
- `logics/backlog/item_053_dungeon_onboarding_roster_gate_and_fourth_hero_naming.md`
- `logics/backlog/item_054_dungeon_cta_entry_and_dedicated_screen_flow.md`
- `logics/backlog/item_055_dungeon_party_setup_and_run_preparation.md`
- `logics/backlog/item_056_headless_dungeon_combat_simulation_core.md`
- `logics/backlog/item_057_dungeon_v1_data_pack_and_boss_mechanics.md`
- `logics/backlog/item_058_dungeon_consumables_meat_and_auto_heal_potions.md`
- `logics/backlog/item_059_dungeon_persistence_offline_catch_up_and_latest_run_replay.md`
- `logics/backlog/item_060_dungeon_live_render_and_replay_viewer_arena.md`
- `logics/backlog/item_061_dungeon_multi_party_ready_architecture.md`
