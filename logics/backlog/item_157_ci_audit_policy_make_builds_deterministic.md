## item_157_ci_audit_policy_make_builds_deterministic - Adjust CI audit policy to avoid non-deterministic red builds
> From version: 0.9.31
> Understanding: 94%
> Confidence: 90%
> Progress: 0%
> Complexity: Low
> Theme: DevEx / CI
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`npm audit` can fail CI due to newly published advisories, causing red builds unrelated to code changes.

# Scope
- In:
- Change CI behavior to be deterministic:
  - recommended: PR/push uses `npm audit --audit-level=high` (or remove as blocking gate)
  - scheduled workflow runs `--audit-level=moderate` in report-only mode
- Update `readme.md` (or contributing docs) to describe the chosen policy.
- Out:
- No dependency upgrades required unless needed to restore baseline stability.

# Acceptance criteria
- CI no longer fails due to moderate advisories appearing after the fact (without code changes).
- Policy is documented.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.

