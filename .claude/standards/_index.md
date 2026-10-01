# Standards Index

> Routing table for `standards/*`. The AI loads only files whose triggers match. All standards are subordinate to `memory/decisions.md` (project ADRs).

## Always load (every prompt)

| File | Reason |
|---|---|
| `quick-rules.md` | non-negotiables — cheap |
| `../memory/decisions-index.md` | one line per ADR — prevents repeating settled debates |

## Always load (security-sensitive code)

| File | Reason |
|---|---|
| `security.md` | MANDATORY before any code touching the Storefront token, `.env`, merchant config, deep links, webviews, network logging, or storage. |

## Trigger-based load

| Triggers (keywords matching the prompt) | File |
|---|---|
| `shopify`, `storefront`, `graphql`, `metafield`, `metaobject`, `variant`, `collection`, `merchant`, `winter collection`, `care instructions` | `shopify.md` |
| `architecture`, `layer`, `folder`, `domain`, `adapter`, `service`, `use case`, `data flow`, `barrel`, `alias` | `architecture.md` |
| `screen`, `component`, `navigation`, `react query`, `restyle`, `hook`, `flatlist`, `product card`, `product detail` | `frontend.md` |
| `design`, `token`, `theme`, `palette`, `typography`, `spacing`, `badge style`, `empty state`, `loading`, `identity` | `design.md` |
| `token`, `secret`, `.env`, `credential`, `deep link`, `webview`, `log`, `storage` | `security.md` |
| `naming`, `barrel`, `alias`, `kebab`, `PascalCase`, `file name` | `naming.md` |
| `blank line`, `code style`, `formatting`, `comment`, `import order`, `file order`, `helper` | `code-style.md` |
| `issue`, `bug`, `ticket`, `crash`, `não funciona`, `regression`, `root cause` | `issue-protocol.md` |

## Templates (load on demand)

| Need | Load |
|---|---|
| New Shopify-backed domain (api + service + adapter + types + useCase) | `../templates/shopify-domain.md` |
| Merchant asks for a new metafield-driven feature (Cases 3-5) | `../templates/metafield-feature.md` |
| Capturing an incoming bug/request | `../templates/issue.md` |

## Anti-bloat

- Match triggers strictly
- Quick-rules covers the **what**; full standards cover the **why** + edge cases
- Templates are copy-paste skeletons; do not regenerate equivalent code from memory
