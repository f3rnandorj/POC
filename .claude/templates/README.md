# Templates

> Copy-paste skeletons. Replace placeholders when copying. Reach for these before regenerating structure from memory.

| Template | When to use |
|---|---|
| `shopify-domain.md` | new domain backed by the Storefront API (api + service + adapter + types + useCase) |
| `metafield-feature.md` | merchant asks for a new metafield-driven feature (Cases 3-5) — the reusability path |
| `issue.md` | capturing an incoming bug or merchant request |

## How to use

1. Read the template.
2. Copy the blocks you need.
3. Replace placeholders — naming follows `../standards/naming.md`.
4. Exercise the change in the simulator (there is no test suite — see quick-rule #11).

## When a template feels wrong

1. Apply the override locally.
2. If it should generalize, propose updating the template.
3. Append an ADR to `../memory/decisions.md` explaining the change.
