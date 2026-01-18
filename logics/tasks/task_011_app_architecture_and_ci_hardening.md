## task_011_app_architecture_and_ci_hardening - App split, deps hygiene, CI docs
> From version: 0.6.3  
> Understanding: 92%  
> Confidence: 90%  
> Progress: 0%

# Context
App.tsx reste volumineux malgré les panels extraits. La dette UX/UI sur les contrôles
d’inventory et la commutation des panneaux complique la lisibilité et les tests. Des
vulnérabilités npm (1 low, 1 moderate, 1 high) sont signalées. Le workflow CI/local
gagnerait à être mieux documenté avec un badge de statut.

# Goal
Simplifier l’architecture de l’app pour la lisibilité et les tests, corriger les vulnérabilités
npm et documenter clairement le workflow CI/local (avec badge de statut).

# Plan
- [ ] 1. Architecture App (item_010) : gros découpage acceptable. Extraire des sous-composants dédiés
      (InventoryControls, SidePanelSwitcher, modals/loadout/offline recap si pertinent), mutualiser
      les hooks de persistance, réduire la taille de App.tsx sans changer le comportement. Ajouter
      des tests RTL pour le basculement des panneaux et la persistance des filtres.
- [ ] 2. Sécurité dépendances : appliquer `npm audit fix` ou mises à jour ciblées pour résoudre
      les vulnérabilités (1 low, 1 moderate, 1 high) en restant compatible; ajouter un job CI
      (ou step) audit qui échoue à partir de moderate, tolère low avec warning.
- [ ] 3. Documentation CI/local : enrichir README et CONTRIBUTING avec le workflow local/CI
      (dev, lint, tests, coverage, audit), et ajouter un badge de statut GitHub Actions.
- [ ] 4. E2E smoke offline recap : ajouter un test (Playwright ou RTL renforcé) couvrant le cycle
      de reprise offline (recap affiché et validé).
- [ ] 5. Perf/UI : profiler Inventory/Stats (render count) et ajouter memo/`React.memo` ciblés pour
      les listes volumineuses (200+ items).
- [ ] 6. Accessibilité : audit axe/jest-axe sur Roster/Inventory/Stats, corriger contrastes/focus.
- [ ] 7. Hooks de persistance : extraire dans un module dédié avec tests unitaires (reset, erreurs
      storage, valeurs par défaut).
- [ ] 8. CI qualité : ajouter un job “preview build + smoke” (vite build + preview + RTL smoke) sur
      chaque PR/push pour détecter les erreurs de bundling avant merge.
- [ ] FINAL: Validate acceptance, update docs/backlog/task status, and verify performance.

# Acceptance
- App.tsx allégé : contrôles d’inventory et switch de panneau extraits en composants, hooks
  de persistance réutilisables, tests existants verts.
- `npm audit` ne reporte plus de vulnérabilités (ou explicitement ignorées/documentées), CI
  contient un job de vérification des vulnérabilités (échoue à partir de moderate).
- README/CONTRIBUTING décrit clairement les commandes locales/CI (dev, lint, tests, coverage,
  audit) et affiche un badge CI GitHub Actions.
- Un smoke offline recap valide le scénario de reprise; perf UI améliorée (memo ciblés), axe/a11y
  corrigés sur panels; job preview+smoke en CI passe.
