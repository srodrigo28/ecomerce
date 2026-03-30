# Plano da API Lojas

## Objetivo da API

A API do Hierarquia sera a camada backend que vai substituir os mocks do frontend sem mudar a experiencia que ja foi validada.

Ela precisa nascer com tres prioridades muito claras:

- operar lojas, catalogo e pedidos sem retrabalho no frontend;
- sustentar estoque, vendas e relatorios com consistencia;
- crescer por modulos, sem acoplamento desnecessario.

A tecnologia escolhida para esta fase sera:

- Python
- Flask
- PostgreSQL
- SQLAlchemy
- Flask-Migrate

## Leitura do estado atual do projeto

## Status de execucao atual

### O que ja foi implementado na base da API

Nesta etapa, ja concluimos a base Flask com PostgreSQL validado e a primeira migration aplicada. Hoje temos:

- estrutura principal de pastas em `api-lojas/app`, `scripts` e `tests`;
- `requirements.txt` criado com Flask, SQLAlchemy, Migrate, CORS, JWT e bibliotecas de apoio;
- `.env.example` criado com variaveis base do backend;
- `run.py` criado para subir a API;
- `app/__init__.py` com application factory;
- `app/config.py` com configuracao por ambiente;
- `app/extensions.py` com `db`, `migrate`, `cors` e `jwt`;
- modulo `health` com endpoint inicial;
- modulos scaffold de `stores`, `categories` e `products`;
- models iniciais de `Store`, `Category` e `Product`;
- schemas iniciais de `Store`, `Category` e `Product`;
- `scripts/dev_setup.py` para validacao basica do ambiente.
- `setup.py` funcionando como checkpoint seguro de execucao;
- PostgreSQL remoto validado com sucesso via `scripts/dev_setup.py`;
- Flask-Migrate inicializado em `migrations/`;
- primeira migration gerada e aplicada no banco;
- tabelas base `stores`, `categories`, `products` e `alembic_version` criadas em PostgreSQL;
- CRUDs reais de `stores`, `categories` e `products` funcionando com rotas, servicos e repositories;
- endpoint real de `category_bases` implementado;
- segunda migration PostgreSQL gerada e aplicada com `category_bases`, `customers`, `addresses`, `orders` e `order_items`;
- coluna `category_base_id` adicionada em `categories` com validacao de regra de negocio;
- fundacao dos modelos de pedidos criada para evoluir checkout, WhatsApp e Pix sem retrabalho.
- CRUDs reais de `customers`, `addresses`, `orders` e `order_items` implementados e validados com smoke test no PostgreSQL remoto.
- endpoint `/api/v1/orders/checkout` criado com transacao completa, calculo automatico de totais e persistencia de itens no PostgreSQL remoto.
- respostas de pedido e checkout enriquecidas com cliente, endereco, loja e itens embutidos para facilitar a integracao com o frontend.
- frontend público já integrado ao endpoint `/api/v1/orders/checkout`, com redirecionamento para sucesso usando o código real do pedido.
- painel do lojista já consumindo leitura real de pedidos da API para validar a operação persistida no PostgreSQL.
- foundation de `stock_movements` criada no PostgreSQL com baixa automática de estoque no checkout.
- domain de `sales` criado no PostgreSQL com venda derivada automaticamente do checkout e cancelamento refletindo em `sale_status`.
- endpoints iniciais de `reports` criados para resumo do lojista e resumo admin usando `sales` confirmadas.

### O que ainda nao foi executado

Os pontos abaixo continuam pendentes para as proximas fases:

- consolidar filtros e consultas mais ricas de `stores`, `categories`, `category_bases` e `products`;
- consolidar filtros e consultas mais ricas de pedidos por loja, cliente e status;
- expor respostas ainda mais operacionais para o painel do lojista e admin;
- adicionar leituras operacionais mais completas de estoque no painel;
- evoluir os relatorios reais com mais agregacoes por categoria, pedido e estoque;
- adicionar autenticacao e autorizacao.

### Confirmacao de alinhamento com o plano

Sim, a implementacao atual esta seguindo o `api-plano.md`.

A ordem executada ate agora foi coerente com o plano:

1. estrutura base do projeto Flask;
2. arquivos centrais como `requirements.txt`, `.env.example`, `run.py`, `app/__init__.py`, `app/config.py` e `app/extensions.py`;
3. organizacao modular inicial para `stores`, `categories` e `products`;
4. preparacao dos modelos e schemas antes da fase de banco e migrations.

O proximo passo correto, ainda dentro do plano, e continuar em:

- Fase 5 - regras de cancelamento e reposicao de estoque;
- Fase 5 e 7 - vendas e leituras operacionais para relatórios.

O frontend ja validou estes fluxos:

- home publica;
- lojas parceiras;
- busca e filtros da vitrine;
- pagina publica da loja;
- pagina publica de produto;
- carrinho;
- checkout;
- pedido confirmado;
- painel do lojista com pedidos, estoque e relatorios;
- painel admin com relatorios.

Isso significa que a API nao deve nascer como experimento solto.

Ela deve nascer servindo exatamente os dominios que ja existem na interface:

- lojas;
- categorias;
- produtos;
- pedidos;
- estoque;
- vendas;
- relatorios;
- usuarios e autenticacao.

## Direcao arquitetural recomendada

A API deve seguir uma organizacao por dominio, e nao um arquivo unico com tudo misturado.

A melhor leitura aqui e usar um MVC por entidade, mas com uma separacao mais pratica para Flask:

```text
api-lojas/
  app/
    __init__.py
    extensions.py
    config.py
    routes/
    models/
    schemas/
    services/
    repositories/
    utils/
    modules/
      auth/
      users/
      stores/
      categories/
      products/
      customers/
      orders/
      stock/
      sales/
      reports/
  migrations/
  tests/
  scripts/
  .env
  .env.example
  run.py
  requirements.txt
```

Se quiser manter a leitura ainda mais direta por entidade, cada modulo pode conter:

- `routes.py`
- `models.py`
- `schemas.py`
- `service.py`
- `repository.py`

Isso deixa o codigo mais claro e evita controller gigante.

## Ajuste importante sobre o `setup.py`

O `setup.py` pode existir sim, mas com um papel mais seguro e objetivo.

Ele nao deve ser tratado como arquivo para ativar venv automaticamente ou controlar toda a vida da aplicacao.

A leitura mais segura aqui e esta:

- `requirements.txt` continua sendo a fonte das dependencias;
- `run.py` continua sendo a entrada para subir a API Flask;
- `setup.py` passa a existir como camada de seguranca de execucao e validacao do ambiente;
- `.env.example` continua documentando a configuracao minima;
- scripts auxiliares continuam podendo existir em `scripts/`.

Ou seja:

- `run.py` sobe a API;
- `setup.py` valida ambiente, estrutura e precondicoes de execucao;
- `requirements.txt` controla bibliotecas;
- `.env.example` documenta configuracao.

### Papel recomendado do `setup.py`

O `setup.py` pode ser usado para:

- validar se arquivos essenciais existem;
- verificar se `.env` foi preenchido;
- checar variaveis obrigatorias;
- validar se a estrutura base da API esta integra;
- opcionalmente testar conexao com banco;
- servir como checkpoint seguro antes de rodar a API.

O que ele nao deve fazer como responsabilidade principal:

- ativar virtualenv por conta propria;
- substituir `requirements.txt`;
- substituir `run.py`;
- virar um ponto unico com toda a logica da API.

## Sequencia recomendada de criacao da API

### Fase 1 - Base do projeto Flask

Status atual: concluida na base principal.

Criar primeiro:

1. estrutura de pastas da API;
2. `requirements.txt`;
3. `run.py`;
4. `app/__init__.py` com application factory;
5. `app/config.py`;
6. `app/extensions.py`;
7. `.env.example`;
8. `scripts/dev_setup.py`.

Resultado esperado:

- API sobe localmente;
- configuracao centralizada;
- conexao com banco pronta para evoluir;
- base profissional para crescer por modulos.

### Fase 2 - Banco e migrations

Status atual: concluida na base principal.

Criar depois:

1. conexao com PostgreSQL;
2. SQLAlchemy;
3. Flask-Migrate;
4. migration inicial;
5. seeds basicas de desenvolvimento.

Resultado esperado:

- banco versionado;
- estrutura confiavel de criacao e evolucao das tabelas;
- ambiente local repetivel.

### Fase 3 - Modulos centrais do catalogo

Status atual: em andamento com PostgreSQL, CRUD real de `stores`, `categories`, `products`, endpoint de `category_bases` e dominio inicial de `product_images` implementado na API.

Criar nesta ordem:

1. lojas;
2. categorias base;
3. categorias da loja;
4. produtos;
5. imagens do produto.

Resultado esperado:

- frontend consegue trocar mocks do catalogo por API real depois;
- base publica e operacional passa a ter persistencia real;
- produto deixa de depender de uma unica `main_image_url` e passa a ter galeria real.

### Fase 4 - Pedidos e clientes

Status atual: CRUDs reais de `customers`, `addresses`, `orders` e `order_items` implementados em PostgreSQL, com endpoint transacional de checkout calculando subtotal, frete e total no backend.

Criar nesta ordem:

1. clientes;
2. enderecos;
3. pedidos;
4. itens do pedido.

Resultado esperado:

- checkout passa a gerar pedidos reais;
- cliente e entrega ficam persistidos;
- operacao da loja comeca a sair do modo visual.

### Fase 5 - Estoque e vendas

Status atual: foundation de `stock_movements` criada em PostgreSQL, checkout baixando estoque automaticamente, cancelamento repondo estoque e `sales` registrando a venda derivada do pedido.

Criar nesta ordem:

1. movimentos de estoque;
2. regras de saida por pedido;
3. regras de retorno em cancelamento;
4. vendas;
5. agregacoes para leitura comercial.

Resultado esperado:

- estoque deixa de ser apenas numero no produto;
- pedido passa a impactar operacao real;
- relatorios comerciais ficam sustentados por dados reais.

### Fase 6 - Autenticacao e autorizacao

Criar nesta ordem:

1. usuarios;
2. login;
3. protecao por perfil;
4. acesso admin e lojista;
5. hardening de seguranca.

Resultado esperado:

- painel do lojista e painel admin passam a ter acesso real;
- credenciais locais deixam de ser provisoria simples.

### Fase 7 - Relatorios e filtros

Status atual: endpoints reais prontos em PostgreSQL e frontend do lojista/admin ja iniciado com consumo direto de `/api/v1/reports`.

Criar nesta ordem:

1. relatorio do lojista por periodo;
2. relatorio por categoria;
3. relatorio admin por lojista;
4. comparativos gerais;
5. endpoints de dashboard.

Resultado esperado:

- frontend admin e lojista passam a consumir leitura real consolidada.

## Plano de tabelas

## Planejamento novo: imagens de produto

O modulo de imagens de produto ja entrou no codigo da API, mas ainda precisa de validacao final com migration aplicada no PostgreSQL e integracao do frontend. O estado atual desta frente e este:

- `products` ainda mantem `main_image_url` por compatibilidade;
- a API agora aceita upload em rotas aninhadas de produto;
- a tabela `product_images` ja esta modelada e migrada no codigo;
- a validacao backend de 1 a 5 imagens com principal obrigatoria ja entrou no service;
- o proximo passo e aplicar a migration e validar o fluxo ponta a ponta.

Isso fecha a lacuna principal do catalogo antes de considerarmos o modulo de produto realmente completo.

### Objetivo do modulo de imagens

Cada produto deve poder ter:

- minimo de 1 imagem;
- maximo de 5 imagens;
- uma imagem principal obrigatoria;
- ordenacao visual da galeria;
- suporte a upload real de arquivo;
- suporte opcional a imagem por URL enquanto o upload evolui;
- resposta da API com galeria completa para o frontend.

### Regras de negocio para imagens

- produto nao pode ser publicado sem ao menos 1 imagem;
- produto nao pode ultrapassar 5 imagens;
- apenas 1 imagem pode estar marcada como principal;
- ao remover a imagem principal, outra precisa assumir ou a operacao deve ser bloqueada;
- a ordem das imagens precisa ser persistida;
- arquivos invalidos devem ser rejeitados antes de gravar;
- extensoes permitidas devem ser controladas pela API;
- tamanho maximo por arquivo deve ser validado;
- o retorno deve expor a imagem principal e a lista completa.

### Sequencia recomendada para fechar imagens

1. aplicar a migration `product_images`;
2. validar model `ProductImage` e relacionamento `Product -> ProductImage`;
3. validar o service de galeria `1..5`;
4. validar upload por produto em `multipart/form-data`;
5. validar listagem, troca de principal e remocao;
6. confirmar retorno do produto com galeria completa;
7. integrar o frontend de produto com multipart real.

### Rotas recomendadas para imagens

Base principal:

- `GET /api/v1/products/<product_id>/images`
- `POST /api/v1/products/<product_id>/images`
- `PATCH /api/v1/products/<product_id>/images/<image_id>`
- `DELETE /api/v1/products/<product_id>/images/<image_id>`
- `POST /api/v1/products/<product_id>/images/<image_id>/set-main`

Opcional complementar:

- `POST /api/v1/products/with-images`

Essa rota complementar so vale se quisermos criar produto e imagens em um fluxo unico logo no inicio.

### Contrato minimo esperado do upload

Entrada inicial recomendada:

- `multipart/form-data`;
- campo `files` aceitando 1 ou mais arquivos;
- campo `is_main` opcional por imagem no primeiro envio;
- campo `sort_order` opcional.

Saida esperada:

- `product_id`;
- `images[]`;
- `main_image`;
- contagem atual de imagens;
- status da validacao da galeria.

### Validacoes recomendadas do backend

- aceitar apenas `jpg`, `jpeg`, `png`, `webp`;
- limitar tamanho por arquivo;
- rejeitar upload acima de 5 imagens por produto;
- garantir pelo menos 1 imagem antes de publicar o produto;
- impedir duas imagens principais ao mesmo tempo;
- recalcular principal automaticamente se a atual for removida quando fizer sentido.

### Estrategia de storage inicial

Para a fase atual, a estrategia mais simples e segura e:

- salvar arquivo localmente em uma pasta controlada da API em desenvolvimento;
- persistir no banco apenas os metadados e a URL/caminho publico;
- deixar S3, Cloudinary ou storage externo para a fase seguinte.

### Critico para o frontend

O frontend ja trabalha com galeria, preview e imagem principal. Entao a API precisa refletir exatamente isso:

- `images[]`;
- `main_image_url`;
- `sort_order`;
- `is_main`;
- limite `1..5`.

Sem esse modulo, o cadastro de produto permanece incompleto do ponto de vista real de operacao.

## Tabela `users`

Campos sugeridos:

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `status`
- `store_id` nullable
- `created_at`
- `updated_at`

Observacoes:

- `email` unico;
- `role` com `admin`, `seller`, `customer`;
- vendedor deve apontar para uma loja.

## Tabela `stores`

Campos sugeridos:

- `id`
- `name`
- `slug`
- `legal_name`
- `owner_name`
- `owner_email`
- `phone`
- `whatsapp`
- `cnpj`
- `logo_url`
- `cover_image_url`
- `description`
- `pix_key`
- `zip_code`
- `state`
- `city`
- `district`
- `street`
- `number`
- `complement`
- `business_hours`
- `delivery_policy`
- `status`
- `created_at`
- `updated_at`

Observacoes:

- `slug` unico;
- `cnpj` unico;
- `pix_key` obrigatoria no MVP.

## Tabela `category_bases`

Campos sugeridos:

- `id`
- `name`
- `slug`
- `status`
- `sort_order`
- `created_at`
- `updated_at`

## Tabela `categories`

Campos sugeridos:

- `id`
- `store_id`
- `category_base_id` nullable
- `name`
- `slug`
- `description`
- `status`
- `sort_order`
- `created_at`
- `updated_at`

Observacoes:

- categoria pertence a uma loja;
- `store_id + slug` deve ser unico.

## Tabela `products`

Campos sugeridos:

- `id`
- `store_id`
- `category_id`
- `name`
- `slug`
- `description_short`
- `description_long`
- `sku`
- `price_retail`
- `price_wholesale`
- `price_promotion`
- `stock`
- `min_stock`
- `status`
- `is_featured`
- `main_image_url`
- `notes`
- `created_at`
- `updated_at`

Observacoes:

- `store_id + slug` unico;
- `stock` e `min_stock` nao negativos.

## Tabela `product_images`

Campos sugeridos:

- `id`
- `product_id`
- `image_url`
- `storage_path`
- `file_name`
- `mime_type`
- `file_size`
- `sort_order`
- `is_main`
- `created_at`
- `updated_at`

Observacoes:

- produto deve ter entre 1 e 5 imagens;
- apenas 1 imagem principal por produto;
- `sort_order` precisa refletir a ordem da galeria;
- `image_url` e `storage_path` devem permitir montar URL publica depois.

## Tabela `customers`

Campos sugeridos:

- `id`
- `name`
- `email`
- `phone`
- `whatsapp`
- `cpf`
- `created_at`
- `updated_at`

## Tabela `addresses`

Campos sugeridos:

- `id`
- `customer_id`
- `zip_code`
- `state`
- `city`
- `district`
- `street`
- `number`
- `complement`
- `reference`
- `created_at`
- `updated_at`

## Tabela `orders`

Campos sugeridos:

- `id`
- `code`
- `customer_id`
- `store_id`
- `subtotal`
- `shipping_cost`
- `total`
- `payment_method`
- `payment_status`
- `order_status`
- `delivery_type`
- `address_id` nullable
- `notes`
- `created_at`
- `updated_at`

Observacoes:

- `code` unico;
- endereco obrigatorio apenas para entrega.

## Tabela `order_items`

Campos sugeridos:

- `id`
- `order_id`
- `product_id`
- `product_name_snapshot`
- `unit_price`
- `quantity`
- `line_total`
- `category_id`
- `created_at`

## Tabela `stock_movements`

Campos sugeridos:

- `id`
- `product_id`
- `store_id`
- `related_order_id` nullable
- `movement_type`
- `source`
- `quantity`
- `previous_stock`
- `current_stock`
- `note`
- `created_at`

## Tabela `sales`

Campos sugeridos:

- `id`
- `order_id`
- `store_id`
- `customer_id`
- `category_id`
- `gross_amount`
- `discount_amount`
- `shipping_amount`
- `final_amount`
- `sale_status`
- `payment_method`
- `sold_at`
- `created_at`

## Ordem recomendada de migrations

1. `stores`
2. `users`
3. `category_bases`
4. `categories`
5. `products`
6. `product_images`
7. `customers`
8. `addresses`
9. `orders`
10. `order_items`
11. `stock_movements`
12. `sales`

## Plano de bibliotecas

## Bibliotecas principais

- `Flask`
  motivo: base da API.
- `Flask-SQLAlchemy`
  motivo: ORM e integracao limpa com Flask.
- `Flask-Migrate`
  motivo: migrations com Alembic.
- `psycopg[binary]`
  motivo: driver moderno e simples para PostgreSQL.
- `python-dotenv`
  motivo: leitura de `.env` no ambiente local.
- `marshmallow`
  motivo: serializacao e validacao de entrada e saida.
- `Flask-JWT-Extended`
  motivo: autenticacao por token quando entrarmos em auth.
- `passlib[bcrypt]`
  motivo: hash seguro de senha.
- `email-validator`
  motivo: validacao de email.
- `Flask-CORS`
  motivo: integracao com o frontend Next em desenvolvimento.

## Bibliotecas de apoio recomendadas

- `pytest`
  motivo: testes.
- `pytest-flask`
  motivo: apoio a testes de API.
- `factory-boy`
  motivo: fixtures e factories.
- `Faker`
  motivo: seeds e testes com dados falsos.
- `alembic`
  motivo: base de migration ja puxada pelo Flask-Migrate.
- `gunicorn`
  motivo: deploy em ambiente Linux depois.

## Bibliotecas que eu evitaria agora

- Celery
- Redis
- Pydantic como camada principal
- arquitetura hexagonal pesada demais
- filas e eventos antes da operacao base ficar pronta

Motivo:

- aumentam custo de setup cedo demais;
- o projeto ainda precisa primeiro consolidar CRUD, pedido, estoque e venda.

## Sequencia pratica de bibliotecas para instalar

### Etapa 1 - Base minima

Instalar primeiro:

- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- psycopg[binary]
- python-dotenv
- Flask-CORS

### Etapa 2 - Validacao e seguranca

Depois instalar:

- marshmallow
- email-validator
- passlib[bcrypt]
- Flask-JWT-Extended

### Etapa 3 - Testes e apoio

Depois instalar:

- pytest
- pytest-flask
- factory-boy
- Faker

### Etapa 4 - Deploy

Depois instalar:

- gunicorn

## Plano de arquivos base

Arquivos recomendados para criar primeiro:

- `requirements.txt`
- `.env.example`
- `setup.py`
- `run.py`
- `app/__init__.py`
- `app/config.py`
- `app/extensions.py`
- `app/modules/__init__.py`
- `scripts/dev_setup.py`
- `tests/__init__.py`

## Conteudo esperado do `.env.example`

Sugestao de variaveis:

- `FLASK_ENV=development`
- `SECRET_KEY=`
- `JWT_SECRET_KEY=`
- `DB_HOST=`
- `DB_PORT=5432`
- `DB_NAME=`
- `DB_USER=`
- `DB_PASSWORD=`
- `DB_SSL_MODE=prefer`
- `CORS_ORIGINS=http://localhost:3000`
- `ADMIN_DEFAULT_EMAIL=`
- `ADMIN_DEFAULT_PASSWORD=`

## Papel do `setup.py`

Esse arquivo deve funcionar como seguranca de execucao e validacao do ambiente.

Ele deve:

- validar se arquivos essenciais existem;
- verificar se `.env` esta presente;
- checar variaveis obrigatorias;
- orientar o desenvolvedor sobre pendencias antes de subir a API;
- opcionalmente disparar validacoes basicas locais.

Ele nao deve substituir `run.py` nem a estrutura principal do projeto.

## Papel do `scripts/dev_setup.py`

Esse script deve:

- validar se `.env` existe;
- validar se as variaveis obrigatorias foram preenchidas;
- testar conexao com PostgreSQL;
- mostrar mensagens amigaveis se faltar configuracao;
- opcionalmente rodar migrations;
- opcionalmente criar seed admin local.

Esse script nao deve tentar ativar venv automaticamente.

## Sequencia de implementacao recomendada para seguir no dia a dia

1. criar estrutura Flask base;
2. configurar PostgreSQL e migrations;
3. criar modelos `stores`, `users`, `categories`, `category_bases`, `products`;
4. criar CRUD de lojas;
5. criar CRUD de categorias base;
6. criar CRUD de categorias;
7. criar CRUD de produtos;
8. criar clientes, enderecos e pedidos;
9. criar itens do pedido;
10. criar movimentos de estoque;
11. criar vendas;
12. criar auth com JWT;
13. criar endpoints de relatorio do lojista;
14. criar endpoints de relatorio admin;
15. substituir mocks do frontend gradualmente.

## Criterio de pronto da API MVP

A API pode ser considerada pronta para a primeira integracao real quando conseguir:

- autenticar admin e lojista;
- cadastrar e editar lojas;
- cadastrar e editar categorias por loja;
- cadastrar e editar produtos com imagens;
- criar pedidos com itens;
- registrar movimentos de estoque;
- registrar vendas derivadas do pedido;
- responder relatorios basicos de lojista e admin;
- entregar JSON consistente com os contratos validados no frontend.


## Confirmacao operacional atual

Estado confirmado em 2026-03-30:

- banco oficial da API: PostgreSQL remoto;
- conexao validada via `scripts/dev_setup.py`;
- migration inicial aplicada com `stores`, `categories` e `products`;
- segunda migration aplicada com `category_bases`, `customers`, `addresses`, `orders` e `order_items`;
- revisao atual do Alembic no PostgreSQL: `a9c8d7e6f5b4`;
- endpoints ativos e respondendo: `/`, `/api/v1`, `/api/v1/health`, `/api/v1/stores`, `/api/v1/categories`, `/api/v1/products`, `/api/v1/category-bases`, `/api/v1/customers`, `/api/v1/addresses`, `/api/v1/orders`, `/api/v1/order-items`, `/api/v1/stock/movements`, `/api/v1/sales`, `/api/v1/reports/seller` e `/api/v1/reports/admin`;
- smoke test completo passando com criacao real de cliente, endereco, pedido e item do pedido no PostgreSQL remoto;
- checkout transacional validado no endpoint `/api/v1/orders/checkout` com calculo real de subtotal, frete e total no backend;
- `GET /api/v1/orders/:id` e a resposta do checkout ja retornam dados embutidos de cliente, endereco, loja e itens;
- modulo de imagens de produto implementado, migration aplicada no PostgreSQL e rotas validadas com smoke test real;
- checkout validado com baixa real de estoque e criacao de `stock_movements` no PostgreSQL remoto;
- cancelamento validado com reposicao automatica de estoque e movimentacao `entrada/cancelamento`;
- venda derivada validada com registro automatico em `sales` e marcacao como `cancelled` quando o pedido e cancelado;
- endpoints iniciais de relatorio respondendo com resumo do lojista e resumo admin baseados em `sales`;
- frontend de relatorios do lojista e admin ja consumindo a API real de `reports`, com fallback visual para mocks enquanto a base operacional evolui;
- rota raiz e `/api/v1` agora entregam um indice agrupado por rotas para visualizar todos os endpoints criados.

## Proxima sequencia recomendada de execucao

1. integrar o frontend de cadastro de produto com multipart real;
2. substituir o armazenamento local temporario de imagens do frontend pelo fluxo da API;
3. depois seguir com o restante da autenticacao e dos refinamentos operacionais.

## Resumo objetivo

Seu plano inicial tinha uma boa intuicao de clareza por entidade, mas estava curto e colocava responsabilidade demais em `setup.py`.

A versao melhorada do plano agora fica assim:

- usar Flask com estrutura modular por dominio;
- usar PostgreSQL com migrations desde o inicio;
- criar primeiro catalogo, depois pedido, depois estoque e vendas;
- documentar bem `.env.example` e bibliotecas;
- deixar autenticacao e relatorios entrarem depois da base operacional;
- manter a API alinhada ao frontend que ja foi validado.
