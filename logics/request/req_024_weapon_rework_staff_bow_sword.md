## req_024_weapon_rework_staff_bow_sword - Weapon rework (staff, bow, sword)
> From version: 0.9.9
> Understanding: 92%
> Confidence: 88%

# Needs
- Apply the new modifiers primarily at the weapon category level (Melee/Ranged/Magic).
- Magic (staff) weapons enable a cooldown-based heal on other party members and the wearer takes +10% damage received.
- Ranged (bow) weapons attack 50% faster but the wearer takes +25% damage received.
- Melee (sword) weapons grant +25% threat generation and reduce damage received by 10%.
- Surface clear tooltips in item detail for the above effects.

# Context
- Current weapons are mostly stat-only and lack combat identity.
- Dungeon combat is deterministic; weapon effects must preserve determinism.
- Item detail UI already displays descriptions; this request adds explicit effect tooltips.

# Goals
- Distinct, readable combat identities tied to Melee/Ranged/Magic categories.
- Keep combat deterministic and compatible with replay/offline catch-up.
- Communicate tradeoffs (risk vs reward) in item tooltips.

# Locked decisions (v1)
- Magic weapons (staff category):
  - Grant a targeted heal to another party member on a cooldown.
  - Wearer takes +10% damage received.
  - Recommended defaults:
    - Cooldown: `4000ms`.
    - Target: lowest %HP ally (excluding self); deterministic tie-break by party order (or seeded order).
    - Heal amount: `25%` of target max HP (min 1), only if target is missing HP.
- Ranged weapons (bow category):
  - Attacks 50% faster.
  - Wearer takes +25% damage received.
- Melee weapons (sword category):
  - +25% threat generation.
  - Wearer takes -10% damage received.

# Scope detail (draft)
- Data:
  - Map category effects to `WeaponType` (Melee/Ranged/Magic).
  - Add a baton item if needed, but the core behavior is category-driven.
  - Update item tooltips to reflect category effects (not just specific items).
- Combat logic:
  - Apply damage-taken modifiers per equipped weapon.
  - Apply attack speed modifier for bows.
  - Apply threat modifier for swords.
  - Add magic-weapon heal behavior with a fixed cooldown; deterministic target selection required.
- UI:
  - Add tooltip text in item detail to describe weapon effects and tradeoffs.

# Technical references to update
- `src/data/equipment.ts`
- `src/app/ui/inventoryMeta.ts`
- `src/core/dungeon.ts` (combat/heal/threat)
- `src/core/types.ts` (if new runtime state is required)
- `src/app/components/InventoryPanel.tsx` or item detail components (if tooltip plumbing changes)

# Acceptance criteria
- Magic weapons heal a party member on cooldown; wearer takes +10% damage.
- Magic heal targets the lowest %HP ally (excluding self) with deterministic tie-breaks.
- Ranged weapons attack 50% faster; wearer takes +25% damage.
- Melee weapons increase threat by 25% and reduce damage taken by 10%.
- Tooltips explicitly list these effects in the item detail view, tied to the weapon category.
- Combat/replay determinism is preserved.

# Risks / open points
- Cooldown timing and heal target selection must be deterministic.
- Balance tuning may be needed after first pass.

# Backlog
- Triage into items after approval.
