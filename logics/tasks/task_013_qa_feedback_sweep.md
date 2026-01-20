## task_013_qa_feedback_sweep - Execute backlog item 013
> From version: 0.7.2
> Understanding: 95%
> Confidence: 92%
> Progress: 100%

# Context
This task executes `item_013_qa_feedback_sweep`.

# Plan
- [x] 1. Roster + System entry: remove the roster Inventory button and make the version badge the only System entry (inline SVG gear icon, subtle button styling, hover + pointer).
- [x] 2. Action panel: move the ACT control into the Action panel header (right-aligned) and use a descriptive action-change label (shipped label: "Change") using existing button styles.
- [x] 3. Stats panel: move the SET control into the Stats panel header (right-aligned) and use a descriptive rename label (shipped label: "Rename") using existing button styles.
- [x] 4. Offline recap: add a compact time-away formatter (`Xs`, `Xm Ys`, `Xh Ym`) and use it in the recap.
- [x] 5. Inventory UI spacing: add 12px desktop spacing between Sort label and Name/Count controls, and between Search label and input.
- [x] 6. Pagination: remove the pagination row from the DOM when there is only one page.
- [x] 7. Update/extend tests to cover the moved controls, version badge click, and pagination hiding.
- [x] 8. Run lint/tests and validate UI manually on desktop.
- [x] FINAL: Update backlog/task docs and confirm acceptance criteria.

# Report
1. Removed roster Inventory/System buttons, moved Change action/Rename hero into panel headers, and wired the version badge as the System entry.
2. Added offline recap duration formatting, inventory spacing adjustments, and pagination hiding for single-page inventories.
3. Updated tests for the new controls and ran `npm run lint` and `npm run test:ci`.
4. Manual desktop UI validation is still pending.
