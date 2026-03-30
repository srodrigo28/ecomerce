# Hierarquia

Frontend em Next.js para um e-commerce multiloja de moda, construído para validar experiência pública, operação da loja e visão administrativa antes da integração da API.

## Estado atual do projeto

Nesta fase, o frontend já entrega uma base madura do produto:

- home comercial com navegação clara, CTA para lojista e busca pública;
- página de cadastro de loja, login e vitrine de lojas parceiras;
- busca pública por loja, categoria e produto;
- filtros visuais na vitrine geral e na página de cada loja;
- jornada pública completa com loja, produto, carrinho, checkout e pedido confirmado;
- vitrine da loja em formato marketplace, com compartilhamento da loja, categoria e produto;
- modal de compra no detalhe do produto com endereço da loja, WhatsApp, Pix e salvamento local do pedido;
- painel do lojista com dashboard, módulo dedicado de pedidos, estoque, relatórios e configuração da loja;
- leitura de pedidos locais da vitrine dentro do módulo de pedidos do lojista;
- painel admin com dashboard inicial e módulo dedicado de relatórios;
- sistema de temas com `light`, `dark`, `areia` e `grafite`;
- estados de rota para loading e error nos segmentos principais do storefront e do painel do lojista;
- camada de serviços, mocks e tipos pronta para troca gradual por API.

## Stack atual

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4

## Estrutura principal

```text
src/
  app/
    page.tsx
    lojas-parceiras/
    lojas/[slug]/
    painel-lojista/
    painel-admin/
  components/
    public-flow-progress.tsx
    seller-product-form.tsx
    seller-orders-board.tsx
    seller-stock-board.tsx
    seller-reports-board.tsx
    store-purchase-modal.tsx
    store-settings-form.tsx
    theme-switcher.tsx
    ui-button.tsx
    ui-badge.tsx
    ui-card.tsx
    ui-form.tsx
    ui-modal.tsx
  lib/
    config.ts
    mock-data.ts
    local-order-storage.ts
    services/
  types/
```

## Como rodar

```bash
npm install
npm run dev
```

Aplicação local padrão:

```text
http://localhost:3000
```

## Comandos úteis

```bash
npm run dev
npm run lint
npm run build
```

## Variáveis de ambiente

Use o arquivo `.env.example` como referência e preencha `.env` conforme a evolução do projeto.

Os grupos principais são:

- URL pública do app
- URL base da API
- endpoints por recurso
- timeout de requisição
- token server-to-server
- ativação de mocks locais
- credenciais administrativas locais de desenvolvimento quando necessário

## O que já está validado

### Área pública

- proposta comercial clara na home;
- busca pública da vitrine;
- lojas parceiras como prova social;
- página pública de loja em formato marketplace;
- links compartilháveis da loja e das categorias;
- página pública de produto com modal comercial de compra;
- carrinho visual;
- checkout visual;
- pedido confirmado no frontend.

### Painel do lojista

- dashboard inicial com categorias, pedidos e relatórios;
- cadastro de produtos com categorias base e custom;
- módulo dedicado de pedidos;
- leitura de pedidos locais gerados pela vitrine;
- módulo dedicado de estoque e movimentações;
- módulo dedicado de relatórios;
- módulo próprio de configuração da loja com identidade, WhatsApp, Pix, endereço e política de entrega.

### Painel admin

- dashboard inicial com visão macro;
- leitura por período e por lojista;
- módulo dedicado de relatórios admin.

### Base visual e UX

- tema global com `light`, `dark`, `areia` e `grafite`;
- correções de contraste para dark mode;
- componentes reutilizáveis de botão, badge, card, modal, inputs, textarea, select e filtros;
- loading e error routes nos segmentos principais do App Router.

## Direção atual do produto

A ordem de evolução agora é esta:

1. manter o frontend estável e bem documentado;
2. preservar contratos e componentes reutilizáveis;
3. continuar usando mocks enquanto a API nasce com calma;
4. iniciar a API em Python Flask dentro de `api-lojas`;
5. substituir mocks gradualmente por serviços reais.

## Direção da futura API

Quando o frontend estiver confortável, a etapa final será construir a API em Python Flask.

Ordem recomendada para essa fase:

1. estrutura base do projeto Flask;
2. rotas de lojas e categorias;
3. rotas de produtos;
4. rotas de pedidos;
5. rotas de estoque e movimentos;
6. rotas de vendas e relatórios;
7. autenticação;
8. troca gradual dos mocks por chamadas reais.

## Próximos passos

- estruturar a API Flask em `api-lojas`;
- começar por lojas, categorias e produtos;
- depois ligar pedidos, estoque, vendas e relatórios;
- manter README e plano sincronizados conforme a transição do frontend para backend.
