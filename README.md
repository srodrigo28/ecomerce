# Hierarquia

Frontend em Next.js para um e-commerce multiloja de moda, organizado para validar experiencia, navegacao e operacao comercial antes da entrada da API.

## Estado atual do projeto

Nesta fase, o foco continua no frontend. A base ja entrega:

- home comercial com navegacao superior responsiva;
- entrada clara para cadastro de loja, login e parceiros;
- vitrine publica com dados mockados;
- painel do lojista com indicadores e formulario de produto;
- preview local de imagens com regras de 1 a 5 arquivos ou URLs;
- camada de configuracao pronta para trocar mocks por API depois.

## Stack atual

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4

## Estrutura principal

```text
src/
  app/
    layout.tsx
    page.tsx
    painel-lojista/
  components/
    seller-product-form.tsx
  lib/
    config.ts
    mock-data.ts
    services/
  types/
```

## Como rodar

```bash
npm install
npm run dev
```

Aplicacao local padrao:

```text
http://localhost:3000
```

## Variaveis de ambiente

Use o arquivo `.env.example` como referencia e preencha `.env` conforme a evolucao do projeto.

Os grupos principais sao:

- URL publica do app
- URL base da API
- endpoints por recurso
- timeout de requisicao
- token server-to-server
- ativacao de mocks locais

## Direcao do produto

A ordem atual de construcao e:

1. fortalecer a experiencia publica e a entrada comercial;
2. consolidar cadastro de loja, categorias e produtos;
3. evoluir a vitrine, busca e paginas de detalhes;
4. construir carrinho e checkout frontend-first;
5. conectar a API quando os fluxos estiverem validados visualmente.

## Comandos uteis

```bash
npm run dev
npm run lint
npm run build
```

## Proximos passos imediatos

- refinar a navegacao publica e as secoes da home;
- criar paginas dedicadas para cadastro, login e parceiros;
- estruturar a vitrine com filtros e pagina de loja;
- preparar carrinho e checkout visual;
- depois disso, iniciar a integracao da API sem retrabalhar a interface.
