# FUEGO — Forward Deployed Engineer POC

## Objetivo

Simular, em pequena escala, situações que um **Forward Deployed Design Engineer** pode encontrar trabalhando em uma plataforma como a FUEGO.

O objetivo **não é construir um app de e-commerce completo**.

A POC deve responder:

> "Se eu receber uma nova loja Shopify e alguns requisitos específicos de produto, consigo entender os dados, integrar o Shopify, implementar rapidamente uma experiência em React Native e lidar com uma solicitação específica de cliente?"

Você pode utilizar **IA livremente durante todo o desenvolvimento**.

Tempo máximo recomendado: **1 dia de trabalho**.

---

# Cenário

Você acabou de entrar na equipe da FUEGO.

A plataforma já possui uma base React Native capaz de:

- listar produtos;
- mostrar detalhes de produtos;
- navegar entre telas;
- adicionar produtos ao carrinho.

Seu primeiro cliente é:

## NORTHSTAR CO.

Uma marca fictícia de roupas e acessórios que utiliza Shopify.

A equipe de Merchant Success passou os seguintes requisitos:

### Requisito 1 — Onboarding

Precisamos conectar a loja Shopify da Northstar ao aplicativo.

O app precisa conseguir obter:

- produtos;
- imagens;
- preço;
- variantes;
- coleções.

### Requisito 2 — Customização do cliente

A Northstar possui algumas informações adicionais nos produtos:

- badge;
- material;
- texto promocional.

Essas informações não fazem parte dos campos básicos do produto.

O app deve exibi-las quando estiverem disponíveis.

### Requisito 3 — Custom Product Experience

A Northstar quer que determinados produtos mostrem:

```text
NORTHSTAR ESSENTIAL

R$ 299

Algodão orgânico

Disponível em:
[ Preto ]
[ Branco ]
[ Azul ]

⭐ BEST SELLER

Frete grátis acima de R$ 199

[ ADICIONAR AO CARRINHO ]
```

Nem todos os produtos possuem essas informações.

### Requisito 4 — Nova solicitação do cliente

Depois que você termina a primeira implementação, o Merchant Success manda uma mensagem:

> "The client wants a special badge for products that are part of the Winter Collection."

A informação deve vir do Shopify.

Você precisa decidir:

- onde armazenar essa informação;
- como buscá-la;
- como representá-la no app;
- como tornar a implementação reutilizável.

---

# CASE 1 — Implementar um novo cliente

## Objetivo

Simular o onboarding de uma nova loja.

Você precisa fazer o aplicativo buscar produtos de uma loja Shopify.

### O app deve ter

```text
Home
 │
 ├── Featured Products
 │
 └── Collections

Product List
 │
 └── Product Detail
```

A Product Detail deve mostrar:

- imagem;
- nome;
- preço;
- variantes;
- disponibilidade.

### Requisito técnico

Utilize:

**Shopify Storefront API + GraphQL**

Não é necessário implementar:

- autenticação completa;
- checkout real;
- pagamentos;
- login;
- pedidos.

O objetivo é apenas conseguir:

```text
React Native
      ↓
GraphQL
      ↓
Shopify
      ↓
Products
      ↓
React Native UI
```

### Entrega

Você deve conseguir executar:

```bash
npm install
npm run ios
```

ou Android equivalente.

E visualizar produtos reais retornados pelo Shopify.

---

# CASE 2 — Metafields

Agora imagine que o Merchant Success informa:

> "Northstar stores additional product information using Shopify metafields."

Crie três informações customizadas para produtos:

```text
badge
material
promotion_text
```

Exemplo:

```text
badge = "BEST SELLER"

material = "Organic Cotton"

promotion_text = "Free shipping above $199"
```

## Objetivo

Buscar esses dados através da API e exibi-los no Product Detail.

Exemplo:

```text
┌──────────────────────────┐
│                          │
│        PRODUCT IMAGE     │
│                          │
├──────────────────────────┤
│ NORTHSTAR ESSENTIAL      │
│                          │
│ R$ 299                   │
│                          │
│ ⭐ BEST SELLER            │
│                          │
│ Organic Cotton           │
│                          │
│ Free shipping above $199 │
│                          │
│ [ ADD TO CART ]          │
└──────────────────────────┘
```

### Regra

Se o produto não possuir determinado metafield:

```text
não mostrar nada
```

Não deve aparecer:

```text
Material: undefined
```

nem:

```text
Promotion: null
```

---

# CASE 3 — Solicitação inesperada do cliente

Você recebe:

> "We want to highlight Winter Collection products."

A informação deve ser controlada pelo Shopify.

Você decide criar um metafield:

```text
is_winter_collection
```

Tipo:

```text
boolean
```

Exemplo:

```text
Product A
is_winter_collection = true

Product B
is_winter_collection = false
```

No app:

```text
⭐ WINTER COLLECTION
```

aparece somente para os produtos marcados.

---

# CASE 4 — Transformar a solução em algo reutilizável

Agora vem a parte mais próxima do trabalho real.

Imagine que amanhã outro cliente diga:

> "We also need a product badge."

Você não deveria criar:

```tsx
<NorthstarWinterBadge />
```

A implementação deveria ser genérica.

Por exemplo:

```tsx
<ProductBadge text={product.badge} />
```

Ou:

```tsx
<ProductMetadata
  badge={product.badge}
  material={product.material}
  promotion={product.promotion}
/>
```

A ideia é pensar:

> "Como eu implementaria isso uma vez para Northstar sem transformar a plataforma em código específico para Northstar?"

---

# CASE 5 — Mini tarefa de Forward Deployment

Agora simule uma solicitação enviada pelo cliente.

Você recebe no Slack:

> **Northstar**
>
> We want a new section on the product page.
>
> Products with a `care_instructions` metafield should display a "How to care" section below the product description.
>
> Example:
>
> Washing:
> Machine wash cold
>
> Drying:
> Do not tumble dry
>
> If the information doesn't exist, don't display the section.

Implemente isso.

### Exemplo esperado

```text
PRODUCT DESCRIPTION

Premium organic cotton...

────────────────────

HOW TO CARE

Washing
Machine wash cold

Drying
Do not tumble dry
```

Se não existir:

```text
PRODUCT DESCRIPTION

Premium organic cotton...
```

---

# Arquitetura sugerida

Você é livre para estruturar como quiser.

Não copie exatamente esta arquitetura.

Uma sugestão:

```text
src/

├── api/
│   └── shopify/
│       ├── client.ts
│       ├── queries.ts
│       └── types.ts
│
├── features/
│   └── products/
│       ├── components/
│       ├── hooks/
│       ├── screens/
│       └── services/
│
├── components/
│   ├── ProductCard/
│   ├── ProductBadge/
│   └── ProductMetadata/
│
└── navigation/
```

A ideia é manter Shopify isolado da UI.

Por exemplo:

```text
Shopify API
     ↓
Shopify Adapter
     ↓
Domain/Product Model
     ↓
React Query
     ↓
React Native
```

---

# Dados esperados

Você deve trabalhar com algo semelhante a:

```ts
type Product = {
  id: string;
  title: string;
  description: string;

  price: {
    amount: string;
    currencyCode: string;
  };

  images: string[];

  variants: {
    id: string;
    title: string;
    available: boolean;
  }[];

  metafields: {
    badge?: string;
    material?: string;
    promotionText?: string;
    isWinterCollection?: boolean;
    careInstructions?: {
      washing?: string;
      drying?: string;
    };
  };
};
```

Você pode adaptar o modelo à resposta real da Shopify API.

---

# O que NÃO fazer

Para manter o escopo pequeno, NÃO implemente:

- autenticação de usuário;
- checkout real;
- pagamento;
- push notifications;
- analytics;
- Firebase;
- publicação na App Store;
- publicação na Play Store;
- backend próprio;
- sistema de administração;
- design system completo;
- testes E2E;
- CI/CD;
- login Shopify OAuth completo.

Isso é uma POC.

---

# Bônus opcional

Somente faça se terminar cedo.

## Metaobject

Crie um Metaobject chamado:

```text
Brand Story
```

Com:

```text
title
description
image
```

Exemplo:

```text
NORTHSTAR STORY

Designed for everyday movement.

Our products are made using...
```

Busque o Metaobject através do Shopify e mostre na Home.

---

# Bônus 2 — Configuração por cliente

Imagine que amanhã você tenha:

```text
Northstar
Acme
ExampleBrand
```

Crie uma configuração:

```ts
const merchantConfig = {
  name: "Northstar",

  theme: {
    primaryColor: "#000000",
  },

  features: {
    winterCollection: true,
    productCare: true,
    brandStory: true,
  },
};
```

A ideia é demonstrar que:

```text
mesmo código
     ↓
clientes diferentes
     ↓
features diferentes
```

---

# O que você deve documentar

No README final do seu projeto, responda:

## 1. Shopify

- Como você conectou o app à Shopify?
- Qual API utilizou?
- Por que utilizou Storefront API?
- Como fez as queries GraphQL?

## 2. Metafields

- Como criou os metafields?
- Como os consultou?
- Como tratou valores ausentes?

## 3. Arquitetura

Explique:

```text
Shopify
   ↓
API layer
   ↓
Adapter
   ↓
React Query
   ↓
UI
```

ou a arquitetura que você escolheu.

## 4. Multi-client

Explique:

> "How would you support 50 different merchants without creating 50 completely different applications?"

Não precisa implementar uma solução completa.

Explique apenas sua estratégia.

## 5. O que você faria em produção?

Liste o que ficou propositalmente fora da POC.

Exemplo:

```text
- OAuth
- secure credential management
- checkout
- error monitoring
- analytics
- automated tests
- CI/CD
- app store deployment
```

---

# Critério de sucesso

A POC está concluída se você conseguir demonstrar:

### 1. Novo cliente

```text
Shopify
   ↓
GraphQL
   ↓
React Native
```

### 2. Dados customizados

```text
Shopify Metafield
        ↓
API
        ↓
Product Model
        ↓
UI
```

### 3. Customização

```text
Client requirement
        ↓
Implementation
        ↓
Product UI
```

### 4. Reutilização

```text
Northstar
    ↓
Generic component
    ↓
Future merchants
```

### 5. Comunicação técnica

Você consegue explicar:

> "I received this requirement from the merchant, investigated how their Shopify data was structured, implemented the feature, and made the component reusable."

---

# Desafio final — 5 minutos

No final, imagine que o Merchant Success te manda:

> "The client wants the same feature for another 10 merchants."

Pergunte a si mesmo:

**O que eu teria que mudar?**

Se a resposta for:

> "Eu teria que copiar e colar o código 10 vezes."

Pare e refatore.

Se a resposta for:

> "Só preciso configurar quais metafields/features cada merchant utiliza."

Você provavelmente está começando a pensar no problema como uma plataforma multi-tenant.

---

# Tempo sugerido

## 0h–1h

Setup + entender Shopify + conectar Storefront API.

## 1h–2h30

Products + Product Detail + GraphQL.

## 2h30–4h

Metafields + customizações.

## 4h–5h

Nova solicitação do cliente + componente reutilizável.

## 5h–6h

Refatoração + README + preparar demo.

**Não ultrapasse 6 horas.**

O objetivo não é fazer um produto bonito.

O objetivo é sair sabendo:

> "Eu consigo pegar uma loja Shopify, entender os dados, transformar esses dados em uma experiência React Native e implementar uma solicitação específica de um cliente?"

Se a resposta for sim, a POC cumpriu seu papel.

Entrega minima viavel

Eu reduziria a POC para uma entrega mínima verificável (EMV). A ideia é que, se você parar depois de ~3 horas, já consiga provar que entendeu o fluxo principal da vaga.

EMV

Ao final, você precisa conseguir demonstrar uma única jornada completa:

Shopify
↓
Storefront API / GraphQL
↓
Produto + Metafields
↓
React Native
↓
Product Detail customizada
Caso mínimo

Use 1 loja Shopify fictícia e 2 produtos:

Produto A

Name: Northstar Essential
Price: $299
badge: BEST SELLER
material: Organic Cotton
is_winter_collection: true

Produto B

Name: Everyday Tee
Price: $99
badge: —
material: —
is_winter_collection: false

Seu app precisa ter somente:

┌─────────────────────┐
│ PRODUCTS │
│ │
│ Northstar Essential │
│ $299 │
│ │
│ Everyday Tee │
│ $99 │
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│ NORTHSTAR ESSENTIAL │
│ │
│ $299 │
│ │
│ ⭐ BEST SELLER │
│ │
│ Organic Cotton │
│ │
│ ⭐ WINTER COLLECTION │
└─────────────────────┘
O que isso prova

Se isso funcionar, você demonstrou 4 coisas essenciais da vaga:

Consegue conectar um cliente Shopify
Storefront API
GraphQL
Consegue entender o modelo de dados Shopify
produto
variante
metafield
Consegue transformar requisito de cliente em implementação
badge
Winter Collection
Consegue entregar isso em React Native
API → model → UI
A segunda verificação

Depois que funcionar, faça uma única mudança de cliente:

O Merchant Success manda:

"Northstar also wants a promotion_text displayed on the product page."

Você cria o metafield, busca pela API e adiciona:

Free shipping above $199

sem alterar a arquitetura existente.

Isso é importante porque simula o trabalho real:

Cliente pede feature
↓
Você entende o Shopify
↓
Implementa
↓
Entrega
O que eu consideraria "passou"

Não precisa ter:

carrinho funcionando;
checkout;
autenticação;
app bonito;
arquitetura perfeita;
testes;
backend;
deploy;
Metaobjects;
múltiplos clientes reais.

A EMV está concluída se você consegue fazer uma demo de 5 minutos dizendo:

"I onboarded a Shopify merchant, queried its products through the Storefront API, mapped its custom metafields and rendered a merchant-specific product experience in React Native. Then I received a new merchant requirement and implemented it without coupling the feature to Northstar."

Essa é a entrega que eu faria primeiro.

Depois disso, se ainda tiver tempo, aí sim adicionaria o Case 5 (care_instructions) como segunda solicitação do cliente e, por último, a configuração multi-cliente. Isso evita transformar a POC de 1 dia em um projeto de uma semana.
