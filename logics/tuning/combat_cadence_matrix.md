## combat_cadence_matrix - Cadence tuning matrix (v1)

Use a fixed seed and identical party/equipment across all bands to isolate Agility impact.

### Scenario
- Seed: `1700000000000 + (i * 1000)` for `i = 0..11` (12 runs per band, same seed list).
- Dungeon: `dungeon_ruines_humides` (Tier 1, 10 floors).
- Party: 4 heroes, base stats `Strength 12`, `Agility` banded, `Endurance/Intellect/Luck 5`.
- Gear: none.
- Inventory: `food 999`, `tonic/elixir/potion 20` each, `gold 0`.

### Results
| Agility band | Clear time (median) | Clear time (p90) | Survival rate | Combat XP / hour | Gold/items / hour | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Low | 18s | 18s | 100% | 150.6k | +15.4k gold/hr; -3.3k items/hr | Median values across 12 seeds. |
| Mid | 15s | 16s | 100% | 175.7k | +18.0k gold/hr; -3.6k items/hr | Median values across 12 seeds. |
| High | 13s | 13s | 100% | 202.7k | +20.8k gold/hr; -3.9k items/hr | Median values across 12 seeds. |

### Bounds
- Observed clear time delta vs Low: -28% (High vs Low).
- Observed reward/hour delta vs Low: +34% XP/hr, +35% gold/hr (High vs Low).
