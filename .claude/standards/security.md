# Security Baseline (mobile — React Native CLI)

> **MANDATORY load before any code touching the Storefront token, merchant config, `.env`, network requests, deep links, webviews, storage or logging.**

When reviewing code and a security gap appears (secret in a tracked file, token in a log, unvalidated deep link):

1. Stop the current task.
2. Surface the finding: file + line + what it enables + the concrete fix.
3. **Ask before fixing.** Do not silently fix mid-task; do not silently ignore.

## The Storefront token — the one real secret here

- The Storefront access token is a **public, read-only** token. It is not a server secret, but it is still a credential: it identifies the merchant's store and can be rate-limited or abused if scraped.
- **Never in a tracked file.** It lives in `.env` (gitignored) and reaches the app through `react-native-config`, consumed only in `src/config/merchant/merchants/{merchant}.ts` — one prefixed key pair per merchant (`NORTHSTAR_STOREFRONT_TOKEN`), declared in `config/merchant/merchantEnv.d.ts`. `merchantConfig.ts` validates the **selected** merchant's credentials at startup and names only the missing keys, never a value.
- `.env.example` is tracked and holds **key names only**, no values. `react-native-config` reads it at build time: a new key needs a rebuild, not a reload.
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
- Never render merchant HTML in a WebView. `descriptionHtml` is not used in this POC; plain `description` only. The checkout WebView is the one WebView, and it renders **Shopify's** page, not merchant markup: every navigation is host-checked against the active merchant's `storeDomain` plus Shopify-owned hosts, which the checkout's own card field is served from. Anything else is refused.
- **A host allowlist is parsed strictly and anchored, or it is not an allowlist.** The checkout's check (`isStoreUrl`) requires `https://`, an authority of hostname characters and an optional port, and nothing else — so `user@evil.com` and `evil.com\.shopify.com`, which a browser resolves to `evil.com`, never reach the comparison. Suffixes carry their leading dot (`.shopify.com`), and `shop.app` is an exact host plus `.shop.app`: as a bare suffix it would have matched `evilshop.app`. `.myshopify.com` is **not** in the list — anyone can create a store there, and the merchant's own domain is matched exactly.
- The **storefront password** is a development-store fact, not a credential for the store's data: it gates the theme, while the Storefront token gates the API. It still lives in `.env` like the token, reaches the app through `react-native-config`, is never rendered and never logged — it is only ever typed into Shopify's own password form by the checkout WebView.

## Storage & logging

- **Exactly one thing is persisted: the active cart id**, in MMKV, keyed by merchant (`cart:{merchantId}`). It is a capability token for one cart — whoever holds it can read and change that cart, and nothing else — which is why it may sit on disk while the Storefront token may not. No line, price or total is stored: they always come back from Shopify.
- Beyond that, nothing is persisted — no auth, no user data, no response cache. React Query's in-memory cache is enough; do not add a persisted cache "for later".
- Crash/log tooling (Reactotron, Flipper) is gated on `__DEV__` and never enabled in a release build.
- Redact `authorization`, `x-shopify-storefront-access-token`, `token`, `secret` in any logger config added later.

## Static gate

`bash .claude/scripts/check-security.sh` — gitleaks (secrets, tree + history) + `yarn audit` + semgrep (ERROR). Roda no `.husky/pre-push`, junto do `tsc --noEmit`. A missing scanner **fails** the run: a gate that ran nothing is not a clean gate. Suppressions in `.gitleaks.toml` / `.semgrepignore` each carry a WHY comment.

**Dependency advisories — bloqueia o corrigível, reporta o resto.** `audit-gate.js` lê o `yarn audit --json` e separa high/critical pelo campo `patched_versions`:

| Situação | Gate |
|---|---|
| Patch disponível e não aplicado | **falha** o push — é trabalho nosso |
| `patched_versions: "<0.0.0"` (nenhuma release conserta) | **avisa** e passa |

Travar o push num advisory que ninguém pode consertar não aumenta a segurança: ensina a usar `--no-verify`, e aí o gate inteiro deixa de existir. A política auto-cicatriza — no dia em que o upstream publicar o patch, o advisory muda de lista e volta a bloquear, sem ninguém precisar lembrar de remover uma supressão. **Nunca** há allowlist de ID: um advisory nomeado à mão apodrece em silêncio.

Caso corrente: `braces` #1240992 (high, DoS por regex) entra via `react-native → @react-native/community-cli-plugin → metro`. Metro é bundler de build, não embarca no app, e não existe versão corrigida. Verificar a política com `node .claude/scripts/audit-gate.js --self-check`.
