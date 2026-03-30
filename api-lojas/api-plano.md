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
- MySQL
- SQLAlchemy
- Flask-Migrate

## Leitura do estado atual do projeto

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

## Ajuste importante no seu plano inicial

O plano atual cita um `setup.py` que cria venv, ativa ambiente, instala dependencias, valida conexao e chama a app.

Eu nao recomendo usar `setup.py` para isso.

Melhor abordagem:

- usar `requirements.txt` para dependencias;
- usar `run.py` para subir a aplicacao Flask;
- usar um script auxiliar como `bootstrap.py` ou `scripts/dev_setup.py` para validacoes locais;
- usar `.env.example` para variaveis comentadas;
- nao tentar "ativar venv" por codigo Python, porque isso nao funciona como fluxo confiavel do shell.

Ou seja:

- `run.py` sobe a API;
- `scripts/dev_setup.py` valida ambiente, banco e dependencias;
- `requirements.txt` controla bibliotecas;
- `.env.example` documenta configuracao.

## Sequencia recomendada de criacao da API

### Fase 1 - Base do projeto Flask

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

Criar depois:

1. conexao com MySQL;
2. SQLAlchemy;
3. Flask-Migrate;
4. migration inicial;
5. seeds basicas de desenvolvimento.

Resultado esperado:

- banco versionado;
- estrutura confiavel de criacao e evolucao das tabelas;
- ambiente local repetivel.

### Fase 3 - Modulos centrais do catalogo

Criar nesta ordem:

1. lojas;
2. categorias base;
3. categorias da loja;
4. produtos.

Resultado esperado:

- frontend consegue trocar mocks do catalogo por API real depois;
- base publica e operacional passa a ter persistencia real.

### Fase 4 - Pedidos e clientes

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

Criar nesta ordem:

1. relatorio do lojista por periodo;
2. relatorio por categoria;
3. relatorio admin por lojista;
4. comparativos gerais;
5. endpoints de dashboard.

Resultado esperado:

- frontend admin e lojista passam a consumir leitura real consolidada.

## Plano de tabelas

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
- `sort_order`
- `is_main`
- `created_at`

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
- `PyMySQL`
  motivo: driver para MySQL simples de configurar.
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
- PyMySQL
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
- `DB_PORT=3306`
- `DB_NAME=`
- `DB_USER=`
- `DB_PASSWORD=`
- `DB_CHARSET=utf8mb4`
- `CORS_ORIGINS=http://localhost:3000`
- `ADMIN_DEFAULT_EMAIL=`
- `ADMIN_DEFAULT_PASSWORD=`

## Papel do `scripts/dev_setup.py`

Esse script deve:

- validar se `.env` existe;
- validar se as variaveis obrigatorias foram preenchidas;
- testar conexao com MySQL;
- mostrar mensagens amigaveis se faltar configuracao;
- opcionalmente rodar migrations;
- opcionalmente criar seed admin local.

Esse script nao deve tentar ativar venv automaticamente.

## Sequencia de implementacao recomendada para seguir no dia a dia

1. criar estrutura Flask base;
2. configurar MySQL e migrations;
3. criar modelos `stores`, `users`, `categories`, `products`;
4. criar CRUD de lojas;
5. criar CRUD de categorias;
6. criar CRUD de produtos;
7. criar clientes, enderecos e pedidos;
8. criar itens do pedido;
9. criar movimentos de estoque;
10. criar vendas;
11. criar auth com JWT;
12. criar endpoints de relatorio do lojista;
13. criar endpoints de relatorio admin;
14. substituir mocks do frontend gradualmente.

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

## Resumo objetivo

Seu plano inicial tinha uma boa intuicao de clareza por entidade, mas estava curto e colocava responsabilidade demais em `setup.py`.

A versao melhorada do plano agora fica assim:

- usar Flask com estrutura modular por dominio;
- usar MySQL com migrations desde o inicio;
- criar primeiro catalogo, depois pedido, depois estoque e vendas;
- documentar bem `.env.example` e bibliotecas;
- deixar autenticacao e relatorios entrarem depois da base operacional;
- manter a API alinhada ao frontend que ja foi validado.
