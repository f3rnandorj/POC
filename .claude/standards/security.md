# Security Baseline (mobile — React Native CLI)

> **MANDATORY load before any code touching the Storefront token, merchant config, `.env`, network requests, deep links, webviews, storage or logging.**

When reviewing code and a security gap appears (secret in a tracked file, token in a log, unvalidated deep link):

1. Stop the current task.
2. Surface the finding: file + line + what it enables + the concrete fix.
3. **Ask before fixing.** Do not silently fix mid-task; do not silently ignore.

## The Storefront token — the one real secret here

- The Storefront access token is a **public, read-only** token. It is not a server secret, but it is still a credential: it identifies the merchant's store and can be rate-limited or abused if scraped.
- **Never in a tracked file.** It lives in `.env` (gitignored) and reaches the app through `react-native-config` (or `react-native-dotenv`), consumed once in `src/config/merchant/merchantConfig.ts`.
- `.env.example` is tracked and holds **key names only**, no values.
- Scope it: create the Storefront token with only the `unauthenticated_read_product_listings` / `unauthenticated_read_product_tags` scopes the app needs. Never reuse an Admin API token in the app — that one grants writes and must never reach a device.
- A token committed by accident is **rotated in the Shopify admin**, not just removed from the tree. `gitleaks` scans history; `check-security.sh` runs it.

## What never ships in the bundle

- No Admin API key, no app secret, no webhook signing key.
- No merchant-private data hardcoded as a fallback.

## Network

- HTTPS only; the Storefront endpoint is pinned to a version, never templated from user input.
- **Never log the full request** — the token travels in a header. Log the operation name and the status, not the headers. No `console.log(config)` on the client.
- The client inspects the GraphQL `errors` array and throws a typed error; an error object handed to the UI carries a message safe to display, never the raw payload.

## Input validation

- Deep links / URL params: validate scheme and host explicitly before acting. A product handle or id from a link is untrusted input — pass it through a shape check before querying.
- `JSON.parse` on a metafield value is always inside try/catch. A malformed `json` metafield is a merchant data problem, not a crash.
- Never render merchant HTML in a WebView. `descriptionHtml` is not used in this POC; plain `description` only.

## Storage & logging

- Nothing sensitive is persisted — this POC has no auth, no user data, no cart server-side. React Query's in-memory cache is enough; do not add a persisted cache "for later".
- Crash/log tooling (Reactotron, Flipper) is gated on `__DEV__` and never enabled in a release build.
- Redact `authorization`, `x-shopify-storefront-access-token`, `token`, `secret` in any logger config added later.

## Static gate

`bash .claude/scripts/check-security.sh` — gitleaks (secrets, tree + history) + `yarn/npm audit` (high) + semgrep (ERROR). A missing scanner **fails** the run: a gate that ran nothing is not a clean gate. Suppressions in `.gitleaks.toml` / `.semgrepignore` each carry a WHY comment.
