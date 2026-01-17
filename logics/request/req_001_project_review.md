## req_001_project_review - Review project
> Targeted version: 0.2.0
> Understanding: 95%
> Confidence: 90%

# Needs
Review the project and provide a structured assessment.

# Context
This is a JavaScript idle game engine using Vite and npm. The goal is to assess code quality, architecture, risks, and next steps.

# Goals
- Identify critical issues, risks, and potential regressions.
- Evaluate architecture and maintainability.
- Highlight missing tests or weak coverage areas.
- Provide clear, actionable recommendations.

# Deliverables
- A prioritized list of findings (bugs/risks first).
- Notes on architecture and technical debt.
- Suggested tests or validation steps.
- Optional quick wins (low effort, high impact).

# Constraints
- Use English only.
- Keep the review concise and action-focused.
- Do not propose large refactors unless justified by clear risk.

# Current Status
- Repository scan completed to map architecture, entry points, and UI structure.
- Review completed with prioritized findings.
- Test gaps defined and tests added (unit, build, offline simulation).
- Key fixes applied from review findings.
- UI redesign planned with a modern fantasy direction, more graphical UI, full layout freedom.

# Coverage So Far
- Entry points and loop: `src/main.js`, `src/engine.js`.
- Managers: `src/managers/*`.
- Panels/UI logic: `src/panels/*`.
- Entities/actions/recipes/skills: `src/dataObjects/*`.
- Styles and layout: `index.html`, `styles/*`.
- Existing tests: `tests/*`.

# Key Findings (Initial)
- Extensionless imports that may break in strict ESM contexts.
- Stamina progress can go negative; progress values should be clamped.
- `createLabelValue` hides valid `0` values by showing `N/A`.
- `createSelect` expects `{value,label}` but uses `new Option(...)`.
- Hidden non-ASCII NBSP in `corePanel.js`.
- Offline loop test is a duplicate smoke test; no real offline simulation.

# Next Steps
- Redesign the UI (visual direction + implementation).
