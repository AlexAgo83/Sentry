# Contributing

## Local workflow
- Install deps: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Tests (local config): `npm run tests`
- Coverage (local config): `npm run coverage`
- Tests (CI config): `npm run test:ci`
- Coverage (CI config): `npm run coverage:ci`
- Audit: `npm audit --audit-level=moderate`

## CI workflow
- GitHub Actions runs on each push/PR to `main`: lint, `test:ci`, `coverage:ci`, audit (fail on moderate+), preview build, and smoke (offline recap) against the preview build.

## Branch/PR
- Prefer focused PRs, keep App behavior unchanged unless explicitly stated.
- Include tests when changing logic; RTL for UI flows, vitest for units.

## Reporting issues
- Describe repro steps, expected vs actual, and include logs or screenshots if UI-related.

## Coding style
- TypeScript + React; follow existing patterns and hooks, and keep components small and composable.
