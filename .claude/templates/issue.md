# Template — incoming issue / merchant request

Copy, fill, then follow `standards/issue-protocol.md`. Missing fields get asked before any code.

## Bug

```
**Symptom:**            what the user/merchant sees
**Environment:**        device + OS + build (debug/release), store domain
**Repro steps:**        1. … 2. … 3. …
**Expected vs actual:**
**Severity:**           crash / functional / cosmetic
**First bad version:**  if known
```

Shopify-data bug — answer these before suspecting the app:

```
[ ] Metafield definition exists in the admin
[ ] Definition is PUBLISHED to the Storefront API
[ ] Raw GraphQL response (run outside the app) contains the field
[ ] Adapter output inspected
```

## Merchant feature request

```
**Ask (verbatim):**     paste the message
**Today:**              what the merchant sees now
**Wanted:**             what they want to see
**Data source:**        metafield/metaobject namespace + key + type
**Published to Storefront?**
**When absent:**        what renders when the product lacks the data   ← never optional
**Per-merchant?**       should it be a feature flag, or does every merchant get it
```

Then: `templates/metafield-feature.md`.
