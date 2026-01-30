## item_034_onboarding_hero_creation - Onboarding hero creation
> From version: 0.8.14
> Understanding: 90%
> Confidence: 85%
> Progress: 100%

# Problem
Promoted from `logics/request/req_012_onboarding_hero_creation.md`

# Scope
- In:
- Replace default auto-created hero on first launch with a short onboarding flow.
- Require the player to create a hero before any player record exists.
- After hero creation, open action selection (optionally preselect starter action).
- Keep the flow minimal (1–3 steps) and reuse existing modal styling.
- Out:
- Save schema changes.
- Backend changes.
- Skipping hero creation entirely.

# Acceptance criteria
- When no heroes exist, onboarding modal appears on first launch instead of auto-creating a hero.
- Onboarding requires entering/confirming a hero name; no player is created until completion.
- After creation, action selection opens automatically.
- Returning players with existing saves never see onboarding.
- Flow uses existing modal UI patterns; no regressions in recruit/rename flows.
- Hero name validation matches current rules (e.g., non-empty; same disabled state as recruit modal).

# Priority
- Impact: High (first-time experience + data correctness).
- Urgency: Medium (quality-of-life, but not blocking).

# Notes
- Suggested UX:
  - Single forced step (name + confirm) to minimize friction.
  - Optional “Random name” action to speed up entry.
  - Auto-open action selection after creation (no preselection unless desired).
  - Block other navigation until a hero exists to avoid partial state.
  - Reuse existing HeroNameModal styling and copy patterns.
  - Re-show onboarding after a full save reset when no heroes exist.
  - Autofocus the name input and allow Enter to submit.
  - Keep copy minimal (kicker + title + CTA) to avoid extra tutorial text.
