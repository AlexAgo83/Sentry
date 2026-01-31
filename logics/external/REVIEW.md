# Logics Global Review

_Generated: 2026-01-31 14:44 UTC_

## Snapshot

- Requests: 16
- Backlog items: 36
- Tasks: 31
- Specs: 0

## Findings

- Template placeholders remaining: 0
- Indicators with unknown values (`??%`): 4

### Docs with stale indicators

- [req_000_example](logics/request/req_000_example.md) - Example title (unknown: Understanding, Confidence)
- [req_003_qa_beertime](logics/request/req_003_qa_beertime.md) - Global feedbacks (unknown: Understanding, Confidence)
- [item_000_example](logics/backlog/item_000_example.md) - Example title (unknown: Understanding, Confidence, Progress)
- [task_000_example](logics/tasks/task_000_example.md) - Example title (unknown: Understanding, Confidence, Progress)

### Task progress distribution

| Bucket | Count |
|---|---:|
| (missing) | 0 |
| ??% | 1 |
| 0% | 0 |
| 1–49% | 0 |
| 50–99% | 0 |
| 100% | 30 |
| (invalid) | 0 |

### Backlog progress distribution

| Bucket | Count |
|---|---:|
| (missing) | 0 |
| ??% | 1 |
| 0% | 0 |
| 1–49% | 0 |
| 50–99% | 0 |
| 100% | 35 |
| (invalid) | 0 |

## Recommendations (prioritized)

1. Replace template placeholders in active docs and remove `??%` indicators once the scope is understood.
2. Ensure each backlog item has measurable acceptance criteria and a clear priority (Impact/Urgency).
3. Ensure each task has a step-by-step plan and at least 1–2 concrete validation commands.
4. Keep relationships explicit: link request → backlog → task (and spec when useful).
5. Generate supporting views when the doc set grows: `logics/INDEX.md` + `logics/RELATIONSHIPS.md`.

## Suggested commands

- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 logics/skills/logics-indexer/scripts/generate_index.py --out logics/INDEX.md`
- `python3 logics/skills/logics-relationship-linker/scripts/link_relations.py --out logics/RELATIONSHIPS.md`
- `python3 logics/skills/logics-duplicate-detector/scripts/find_duplicates.py --min-score 0.55`
