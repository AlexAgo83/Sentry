## req_012_onboarding_hero_creation - Onboarding hero creation
> From version: 0.8.14
> Understanding: 70%
> Confidence: 60%

# Needs
- Replace the default auto-created hero on first launch with a lightweight onboarding/tutorial.
- Guide the player through first hero creation (name + confirm) and then into first action selection.
- Avoid creating any player record until the onboarding is completed.
- Keep the flow minimal (1–3 small steps) and consistent with existing modal UI.

# Context
- Today, `createInitialGameState` creates a default hero (id "1") immediately.
- There is already a hero creation flow (recruit modal) that can likely be reused.
- The new flow should feel like a first-time setup/tutorial and should only appear when no heroes exist.
- The change should remain offline-first and should not block the app for returning players with existing saves.
- Selected direction: onboarding goes up to first action selection (hero creation → open action selection).
- Suggested UX elements:
  - ModalShell with “First time setup” kicker and short intro text.
  - Random name option + “Use this” button to reduce friction.
  - Minimal step indicator (1/2 or 1/3) if multi-step.
  - No hard “Skip” for creation (creation required); optional “Skip tips” if tutorial text exists.
  - After creation, auto-open Action Selection and optionally preselect a starter action (e.g., Hunting) or keep it unselected with a CTA.
  - Optional quick-start CTA: “Start with Hunting” in the last step.
  - Optional short tooltips for Action / Bank / Shop dismissed on first interaction.
