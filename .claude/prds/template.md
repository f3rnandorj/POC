# PRD: {Feature name}

**Status:** draft | active | done
**Started:** YYYY-MM-DD
**Shipped:** YYYY-MM-DD (when done)
**Source:** README block `{N}`

## Overview

One paragraph: what is being built, why, what changes for the user.

## Goals

- Measurable outcomes

## Standards Referenced

- `.claude/standards/*` paths whose rules apply (reload before generating code)

## Decisions Referenced

Past ADRs relevant to this PRD (`memory/decisions.md`).

## Quality Gates

- `yarn ios` / `yarn android` — the screen exercised on a running simulator (there is no test suite, quick-rule #11)
- `bash .claude/scripts/check-security.sh` when the block touches token, `.env` or network

## User Stories

> Next US = first in document order with all `Depends on` complete (every AC `[x]`). Complexity >= 8 must be split before the PRD activates.

### US-001: {Title}

As a {role}, I want {capability} so that {benefit}.

**Depends on:** —
**Complexity:** N/10

**Acceptance Criteria:**
- [ ] Concrete checkable item

## Functional Requirements

- FR-1: …

## Non-Goals

What this PRD explicitly does NOT deliver.

## Technical Considerations

Stack notes, contracts, constraints.

## Success Metrics

Measurable conditions for "done".

## Resolved Decisions (YYYY-MM-DD)

Decision + 1-line reason + cross-ref. Converts into ADRs at ship.

## Open Questions

Unresolved items; resolve before moving to `active/`, or state the assumption.
