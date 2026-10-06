# ADR Index (hot — always loaded)

> One line per ADR. Full text + rationale in `decisions.md` (loads only on `adr|decisão|por que decid|override|invariant` prompts). Older entries in `decisions-archive.md`.
>
> On every append: sort each row by which fires first — (1) already promoted into `standards/*`/`CLAUDE.md` → archive now; (2) one-off decision, no cross-cutting reuse → archive after ~21 days; (3) cross-cutting pattern with no `standards/` home → keep up to ~60 days, but promote it into `standards/` before that window closes.

| Date | Decision |
|---|---|
| 2026-10-06 | PRD 015: checkout sai do "fora de escopo" — carrinho é o da Cart API (todo total vem de `cost`, device não soma) e o checkout é o `checkoutUrl` numa WebView; reimplementar pagamento segue fora |
| 2026-10-06 | Senha de dev store se vence **submetendo o formulário** de `/password` na WebView (`{MERCHANT}_STORE_PASSWORD` no `.env`, chave ausente = sem pré-login). O `curl` passava até com senha errada — conclusão que só vale no `curl` não vale para WebView. Gateway de teste é o antigo Bogus, renomeado para "Gateway de pagamento de teste" |
| 2026-10-06 | Persiste só o id do carrinho, em MMKV sob `cart:{merchantId}` — token de capacidade de um carrinho, não credencial; chave por lojista troca o carrinho em vez de limpar |
| 2026-10-06 | Aviso de dev mode é portão antes do checkout, com os cartões de teste, e a copy é do app (não passa por `config/merchant/`). Nasceram `Button`, `Dialog` (extraído do `MerchantSwitchDialog`) e o `footer` do `Screen`, medido por `onLayout` |
| 2026-10-06 | Estoque do carrinho é o da Shopify, que corta sem erro (25 pedidos → 10 no carrinho); o app só **mostra** o teto via `quantityAvailable`. `0` é "não contado" tanto quanto "acabou", então só contagem positiva vira limite |
| 2026-10-06 | `CartButton` é do `Screen`, não das telas: linha do título ou flutuante oposto ao back (`floatingBack`), `cartAction={false}` nas telas de carrinho/checkout. Navega sozinho com import type-only de `@routes` |
| 2026-10-06 | Carrinho ↔ detalhe navega por `popTo`, nunca `push`: o router devolve a rota existente abaixo (trocando os params) e, quando ela não existe, **substitui** a atual em vez de empilhar — pingue-pongue entre as duas não cresce a pilha |
| 2026-10-06 | A WebView do checkout é um canal **não confiável**: a página da Shopify posta mensagens próprias (`{"checkout_completed":true}` vazou como número de pedido na tela). Mensagem agora é parseada, só a de `source: fuego-checkout` dá referência, e ela precisa casar `#\d{3,}`. Conclusão é vigiada por polling — o checkout é documento único e a tela de obrigado não dispara load novo |
| 2026-10-06 | Allowlist de host da WebView é ancorada e parseada estrito: `shop.app` como sufixo cru casava `evilshop.app`, e a regex antiga aceitava autoridade com `@` e `\`. `.myshopify.com` saiu da lista — o domínio do lojista já casa exato |
| 2026-10-06 | Layout saiu do topo e virou a **primeira chave de cada tela** (`screens.{screen}.layout`), resolvido por `homeLayout()`/`productDetailLayout()`; `detail` virou `media`. `declaredAreas` filtra a chave. Eixos do README: quatro → três |
