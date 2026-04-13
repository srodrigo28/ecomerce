# Hierarquia

Frontend em Next.js para um e-commerce multiloja de moda, integrado gradualmente a uma API externa e a uma API própria em Spring Boot.

## Estado atual do projeto

Nesta fase, o frontend já entrega uma base madura do produto:

- home comercial com navegação clara, CTA para lojista e busca pública;
- página de cadastro de loja, login e vitrine de lojas parceiras;
- busca pública por loja, categoria e produto;
- jornada pública com loja, produto, carrinho, checkout e pedido confirmado;
- painel do lojista com dashboard, categorias, pedidos, estoque, relatórios e configuração da loja;
- integração inicial com API real para cadastro de lojas e CRUD de categorias;
- camada de serviços pronta para continuar a troca gradual dos mocks por API.

## Stack atual

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4

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
npm run test:e2e
```

## Variáveis de ambiente

Use [`.env.example`](./.env.example) como referência, mas para rodar localmente crie um arquivo `.env.local`.

Exemplo para consumir a API online publicada:

```env
NEXT_PUBLIC_APP_NAME="OS Loja ONline"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API=https://99dev.pro/loja-api-v1/api/lojas
NEXT_PUBLIC_USE_API_MOCKS=false
```

Exemplo para consumir a API local:

```env
NEXT_PUBLIC_APP_NAME="OS Loja ONline"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API=http://localhost:8080/api/lojas
NEXT_PUBLIC_USE_API_MOCKS=false
```

Observacoes importantes:

- o Next.js nao carrega `.env.example` em runtime;
- depois de alterar `.env.local`, reinicie o `npm run dev`;
- `NEXT_PUBLIC_API` aponta para o endpoint de lojas e o frontend deriva a base da API a partir dele;
- com isso, o frontend monta automaticamente recursos como `/api/categorias`.

## Fluxos integrados hoje

### Cadastro de loja

O frontend envia cadastro para:

```text
POST /api/lojas
```

### Categorias por loja

O frontend ja suporta CRUD completo de categorias com os campos:

- `nome`
- `slug`
- `imageId`
- `lojaId`
- `ativo`

Endpoints esperados:

```text
GET    /api/categorias?lojaId={id}
POST   /api/categorias
PUT    /api/categorias/{id}
DELETE /api/categorias/{id}
```

## Validacao local

Ja validado neste projeto:

- `npm run build`
- `npm run test:e2e`
- cadastro de loja no frontend
- login inicial do lojista no frontend
- CRUD de categorias no painel do lojista

## Proximos passos

- publicar a API com o recurso `/api/categorias` no ambiente online;
- continuar a integracao de produtos vinculados a `loja` e `categoria`;
- evoluir o login atual para autenticacao real na API;
- manter README e plano sincronizados com cada nova fase.
