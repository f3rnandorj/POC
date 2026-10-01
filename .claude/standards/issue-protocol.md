# Issue / incoming request protocol

Applies to anything arriving as a report or a client ask — a bug, a crash, or a Merchant Success message ("the client wants X"). The order is the point.

## 1. Capture

Normalize into: symptom · environment (device/OS/build, store domain) · exact repro steps · expected vs actual · severity · first-bad-version if known. Missing fields → ask the reporter before touching anything. Template: `../templates/issue.md`.

For a **feature** request instead of a bug, capture: what the merchant sees today · what they want to see · where the data comes from (which metafield/metaobject, and is it published to Storefront?) · what happens when the data is absent. That last question is never optional here.

## 2. Reproduce before touching code

A confirmed repro first — a running simulator with the real store, or the actual GraphQL response. **Bug without a confirmed repro does not get fixed blind.** Irreproducible after an honest attempt → the deliverable becomes instrumentation plus the exact evidence needed, not a guess-fix.

For Shopify-data bugs, check in this order before suspecting the app:
1. Is the metafield **published to the Storefront API**? (an unpublished definition returns `null` to a correct query)
2. Does the raw GraphQL response contain the field? (run the query outside the app)
3. Only then look at the adapter, then at the component.

Most "the badge doesn't show" reports die at step 1 or 2.

## 3. Root cause, not symptom

The report names a symptom. Before editing, grep every caller of the function about to change. The fix goes at the shared point all paths route through — one guard in the adapter beats a guard in every screen. Patching only the path the ticket names leaves every sibling caller broken.

## 4. Fix + prevention

No test layer exists here, so prevention is structural: the fix lands in the layer that owns the concern (absence handling → adapter + the generic component, never the screen), and the repro steps go in the PR/commit body as the manual check.

## 5. Report

Product language: what the merchant saw · why it happened (one line) · what now prevents recurrence. A failure found along the way is never a footnote.

## Sizing

| Severity | Depth |
|---|---|
| Crash / wrong price / leaked token | full protocol, drop everything |
| Functional bug | full protocol, capture may be 3 lines |
| Cosmetic | steps 1-4 still apply, proportionally small |
