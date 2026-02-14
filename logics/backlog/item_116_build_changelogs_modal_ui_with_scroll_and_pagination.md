## item_116_build_changelogs_modal_ui_with_scroll_and_pagination - Build changelogs modal UI with scroll and pagination
> From version: 0.9.24
> Understanding: 95%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: UI
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
There is no dedicated changelog presentation layer showing commit history in a readable, paginated format.

# Scope
- In:
- Implement `ChangelogsModal` component.
- Show commit entries with:
  - short SHA
  - title (first commit line)
  - author
  - date/time
  - optional external commit link
- Add list container with vertical scroll behavior.
- Add pagination controls for 10-by-10 navigation (prev/next + current page).
- Add loading/empty/error/retry UI states.
- Ensure responsive behavior on desktop and mobile.
- Out:
- No backend route implementation.
- No app-wide caching policy beyond modal session needs.

# Acceptance criteria
- Modal displays commit items in descending chronology.
- List is scrollable and usable on desktop/mobile.
- Pagination consistently advances by 10 commits per page.
- Loading, empty, and error states are clearly rendered.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_039_settings_changelogs_modal_with_paginated_github_commits.md`.
- Main references: `src/app/components/`, modal styles, existing modal shell patterns.

