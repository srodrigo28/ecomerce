# Plano de evolucao do Hierarquia

## Visao do produto

O Hierarquia sera um e-commerce multiloja com foco inicial em moda, pensado para conectar lojas, catalogos, pedidos e operacao comercial em uma experiencia simples de navegar e operar.

A decisao atual do projeto continua correta: primeiro validar frontend, navegacao, proposta comercial e fluxo de operacao. A API entra depois, quando a interface ja estiver madura o bastante para evitar retrabalho.

## Alinhamento de conceito

No contexto do Hierarquia, `parceiros` devem ser tratados como as proprias lojas cadastradas na plataforma.

Isso significa:

- a secao de parceiros na home representa lojas participantes;
- parceiro nao e um perfil separado do lojista nesta fase;
- a comunicacao publica deve reforcar confianca nas lojas cadastradas;
- a vitrine de parceiros deve funcionar como prova social e descoberta comercial.

Por isso, sempre que o plano citar parceiros, a leitura correta deve ser `lojas parceiras cadastradas no Hierarquia`.

## Prioridade operacional do negocio

O ponto mais importante do Hierarquia nao e apenas publicar lojas e produtos. O nucleo real do negocio esta em permitir que cada loja opere com clareza no dia a dia.

Por isso, tres frentes devem ser tratadas como prioridade estrutural do produto:

- controle de estoque;
- controle de pedidos;
- controle de vendas.

Sem isso, a plataforma vira apenas vitrine. Com isso bem definido, ela passa a funcionar como sistema de operacao comercial.

## Nome das entidades que vamos criar

As principais entidades do projeto nesta fase sao:

- Usuario
- Loja
- Categoria
- CategoriaBase
- Produto
- Cliente
- Pedido
- ItemPedido
- Endereco
- MovimentoEstoque
- Venda
- PainelAdmin
- RelatorioLoja
- RelatorioAdmin

## Campos das entidades principais

### Loja

Campos de cadastro da loja:

- nome da loja;
- slug da loja;
- razao social;
- nome do responsavel;
- email do responsavel;
- senha de acesso;
- telefone;
- WhatsApp;
- CNPJ;
- logo da loja;
- imagem de capa;
- descricao da loja;
- chave Pix;
- CEP;
- estado;
- cidade;
- bairro;
- rua;
- numero;
- complemento;
- horario de atendimento;
- status da loja;
- politica de entrega ou retirada.

### Produto

Campos de cadastro do produto:

- nome do produto;
- slug do produto;
- descricao curta;
- descricao completa;
- categoria vinculada;
- codigo interno ou SKU;
- preco varejo;
- preco atacado;
- preco promocional;
- estoque;
- estoque minimo;
- status do produto;
- destaque na vitrine;
- lista de imagens;
- imagem principal;
- variacoes futuras como cor ou tamanho;
- informacoes complementares do produto.

### Categoria

Campos principais:

- nome da categoria;
- slug da categoria;
- descricao;
- status;
- ordem de exibicao;
- loja vinculada.

### CategoriaBase

Campos principais:

- nome da categoria padrao;
- slug da categoria padrao;
- status;
- ordem padrao de exibicao.

### Usuario

Campos principais:

- nome;
- email;
- senha;
- tipo de acesso;
- status;
- loja vinculada quando existir.

### Cliente

Campos principais:

- nome;
- email;
- telefone;
- WhatsApp;
- CPF opcional;
- enderecos;
- historico de pedidos.

### Pedido

Campos principais:

- codigo do pedido;
- cliente vinculado;
- loja vinculada;
- itens do pedido;
- subtotal;
- frete;
- total;
- forma de pagamento;
- status do pagamento;
- status do pedido;
- tipo de entrega;
- endereco de entrega quando existir;
- observacoes;
- data de criacao.

### MovimentoEstoque

Campos principais:

- produto vinculado;
- loja vinculada;
- tipo de movimento;
- quantidade;
- saldo anterior;
- saldo atual;
- origem do movimento;
- observacao;
- data do movimento.

### Venda

Campos principais:

- pedido vinculado;
- loja vinculada;
- cliente vinculado;
- categoria vinculada;
- valor bruto;
- desconto;
- frete;
- valor final;
- status da venda;
- forma de pagamento;
- data da venda.

## Schema inicial das entidades

### Loja - schema inicial

Campos obrigatorios:

- `name: string`
- `slug: string`
- `ownerName: string`
- `ownerEmail: string`
- `password: string`
- `whatsapp: string`
- `cnpj: string`
- `pixKey: string`
- `zipCode: string`
- `state: string`
- `city: string`
- `district: string`
- `street: string`
- `number: string`
- `status: "draft" | "active" | "inactive"`

Campos opcionais:

- `legalName: string`
- `phone: string`
- `logoUrl: string`
- `coverImageUrl: string`
- `description: string`
- `complement: string`
- `businessHours: string`
- `deliveryPolicy: string`

Validacoes recomendadas:

- `name` com minimo de 3 caracteres;
- `slug` unico, amigavel para URL e sem espacos;
- `ownerEmail` com formato valido;
- `password` com minimo de 6 caracteres nesta fase inicial;
- `whatsapp` obrigatorio;
- `cnpj` com mascara e validacao de formato;
- `pixKey` obrigatoria para operacao comercial;
- endereco minimo obrigatorio para entrega ou retirada;
- `status` inicia como `draft` ate finalizar configuracao.

### Produto - schema inicial

Campos obrigatorios:

- `name: string`
- `slug: string`
- `categoryId: string`
- `priceRetail: number`
- `stock: number`
- `minStock: number`
- `status: "draft" | "active" | "inactive"`
- `imageUrls: string[]`
- `storeId: string`

Campos opcionais:

- `descriptionShort: string`
- `descriptionLong: string`
- `sku: string`
- `priceWholesale: number`
- `pricePromotion: number`
- `isFeatured: boolean`
- `mainImageUrl: string`
- `attributes: Record<string, string>`
- `notes: string`

Validacoes recomendadas:

- `name` com minimo de 3 caracteres;
- `slug` amigavel para URL;
- `categoryId` obrigatorio;
- `priceRetail` maior que zero;
- `priceWholesale` opcional, mas nao maior que `priceRetail` em cenarios promocionais simples;
- `pricePromotion` opcional, mas menor ou igual ao `priceRetail`;
- `stock` inteiro maior ou igual a zero;
- `minStock` inteiro maior ou igual a zero;
- `imageUrls` com minimo de 1 e maximo de 5 imagens nesta fase;
- primeira imagem pode ser tratada como imagem principal quando `mainImageUrl` nao existir.

### Categoria - schema inicial

Campos obrigatorios:

- `name: string`
- `slug: string`
- `storeId: string`
- `status: "active" | "inactive"`

Campos opcionais:

- `description: string`
- `sortOrder: number`

Validacoes recomendadas:

- `name` obrigatorio;
- `slug` amigavel para URL;
- categoria sempre vinculada a uma loja;
- categoria de uma loja nao pode impactar outra loja;
- CRUD de categoria deve ser individual por lojista;
- `sortOrder` usado para ordenar a vitrine.

### CategoriaBase - schema inicial

Campos obrigatorios:

- `name: string`
- `slug: string`
- `status: "active" | "inactive"`

Campos opcionais:

- `sortOrder: number`

Validacoes recomendadas:

- categorias base servem apenas como sugestao inicial;
- categorias base nao substituem o CRUD individual do lojista;
- exemplos iniciais podem incluir `calcas`, `camisas` e `short`.

### Usuario - schema inicial

Campos obrigatorios:

- `name: string`
- `email: string`
- `password: string`
- `role: "admin" | "seller" | "customer"`
- `status: "active" | "inactive"`

Campos opcionais:

- `storeId: string`

Validacoes recomendadas:

- `email` unico;
- `password` obrigatoria na fase inicial sem SSO;
- `storeId` exigido quando `role` for `seller`.

### Cliente - schema inicial

Campos obrigatorios:

- `name: string`
- `email: string`
- `phone: string`

Campos opcionais:

- `whatsapp: string`
- `cpf: string`
- `addresses: Endereco[]`

Validacoes recomendadas:

- `email` com formato valido;
- `phone` obrigatorio para contato;
- `cpf` opcional nesta fase inicial.

### Pedido - schema inicial

Campos obrigatorios:

- `code: string`
- `customerId: string`
- `storeId: string`
- `items: ItemPedido[]`
- `subtotal: number`
- `total: number`
- `paymentMethod: "pix" | "cash" | "card"`
- `paymentStatus: "pending" | "paid" | "failed"`
- `orderStatus: "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled"`
- `deliveryType: "delivery" | "pickup"`
- `createdAt: string`

Campos opcionais:

- `shippingCost: number`
- `deliveryAddress: Endereco`
- `notes: string`

Validacoes recomendadas:

- pedido deve ter pelo menos 1 item;
- `subtotal` e `total` maiores que zero;
- `deliveryAddress` obrigatorio quando `deliveryType` for `delivery`;
- `shippingCost` pode ser zero quando `deliveryType` for `pickup`.

### MovimentoEstoque - schema inicial

Campos obrigatorios:

- `productId: string`
- `storeId: string`
- `movementType: "entry" | "exit" | "adjustment"`
- `quantity: number`
- `previousStock: number`
- `currentStock: number`
- `source: "manual" | "order" | "restock" | "cancellation"`
- `createdAt: string`

Campos opcionais:

- `note: string`
- `relatedOrderId: string`

Validacoes recomendadas:

- todo movimento deve registrar saldo anterior e saldo atual;
- movimento de saida nao pode gerar estoque negativo sem regra explicita;
- movimento originado por pedido deve manter referencia do pedido quando existir.

### Venda - schema inicial

Campos obrigatorios:

- `orderId: string`
- `storeId: string`
- `customerId: string`
- `categoryId: string`
- `grossAmount: number`
- `finalAmount: number`
- `saleStatus: "pending" | "completed" | "cancelled"`
- `paymentMethod: "pix" | "cash" | "card"`
- `soldAt: string`

Campos opcionais:

- `discountAmount: number`
- `shippingAmount: number`

Validacoes recomendadas:

- venda concluida deve nascer de um pedido valido;
- `finalAmount` deve refletir subtotal, desconto e frete;
- categoria deve permitir analise por tipo de produto;
- cancelamento de venda pode exigir reversao de estoque conforme regra operacional.

## Regras de negocio iniciais

### Loja

- loja precisa de WhatsApp e chave Pix para operar no MVP;
- loja precisa de endereco minimo valido;
- loja pode iniciar como rascunho antes de ser publicada.

### Produto

- produto sempre pertence a uma loja;
- produto sempre pertence a uma categoria;
- produto deve ter estoque maior ou igual a zero;
- produto deve ter estoque minimo configuravel;
- produto deve ter de 1 a 5 imagens nesta fase;
- preco promocional nao pode ser maior que o preco varejo.

### Categoria

- cada lojista deve ter CRUD individual de categorias;
- editar categoria de uma loja nao pode impactar categorias de outra loja;
- a plataforma pode oferecer categorias base padrao como `calcas`, `camisas` e `short`;
- no cadastro do produto o lojista deve poder selecionar categoria existente ou clicar em adicionar nova categoria sem sair do fluxo principal.

### Estoque

- toda entrada ou saida deve gerar um movimento de estoque;
- pedido confirmado ou pago deve impactar estoque conforme a regra da operacao;
- cancelamento de pedido pode devolver estoque;
- produto com estoque igual ou abaixo do minimo deve entrar em alerta;
- produto sem estoque nao deve seguir para compra normal.

### Pedido

- pedido deve ter ao menos um item;
- retirada nao exige endereco de entrega;
- entrega exige endereco valido;
- status do pedido e status do pagamento devem ser tratados separadamente.

### Venda

- venda nasce a partir de pedido;
- nem todo pedido pago precisa estar entregue para ser considerado venda concluida, isso depende da regra operacional definida;
- dashboard da loja deve somar vendas por dia, semana e mes;
- dashboard da loja deve permitir filtro por categoria quando possivel.

## Nucleo operacional da loja

### Controle de estoque

O controle de estoque precisa existir como modulo central do lojista.

O painel da loja deve permitir:

- visualizar estoque atual por produto;
- visualizar estoque minimo por produto;
- identificar produtos com estoque baixo;
- registrar entradas manuais de estoque;
- registrar saidas por pedido;
- revisar historico de movimentacoes;
- sinalizar produtos indisponiveis.

### Controle de pedidos

O controle de pedidos precisa ser um dos focos principais do painel.

O painel da loja deve permitir:

- listar pedidos recebidos;
- visualizar status de pagamento;
- visualizar status operacional do pedido;
- mudar pedido entre pendente, confirmado, preparando, enviado, entregue e cancelado;
- consultar detalhes de itens, cliente e entrega;
- filtrar pedidos por periodo e status.

### Controle de vendas

O controle de vendas precisa mostrar resultado comercial da loja.

O painel da loja deve permitir:

- visualizar total vendido no dia;
- visualizar total vendido na semana;
- visualizar total vendido no mes;
- visualizar ticket medio futuro;
- relacionar vendas aos pedidos pagos ou concluidos;
- enxergar tendencia de crescimento ou queda.

## Relatorios e filtros essenciais

### Relatorios do lojista

O lojista precisa conseguir analisar a operacao da propria loja com filtros simples e diretos.

Filtros obrigatorios para o lojista:

- por dia;
- por semana;
- por mes;
- por categoria;
- por status do pedido;
- por status de estoque quando aplicavel.

Visualizacoes recomendadas para o lojista:

- vendas por periodo;
- pedidos por periodo;
- produtos mais vendidos;
- produtos com estoque baixo;
- vendas separadas por categoria;
- pedidos pendentes, confirmados e concluidos.

### Relatorios do admin

O admin precisa conseguir enxergar a plataforma inteira e tambem aprofundar por lojista.

Filtros obrigatorios para o admin:

- por lojista;
- por dia;
- por semana;
- por mes;
- por status do pedido;
- por status da loja;
- por situacao de cadastro quando necessario.

Visualizacoes recomendadas para o admin:

- vendas gerais da plataforma;
- pedidos gerais da plataforma;
- cadastros de lojas por periodo;
- comparativo entre lojistas;
- pedidos por lojista;
- vendas por lojista;
- situacao operacional de cada loja.

## Diagnostico atual do projeto

Hoje a base ja possui bons fundamentos:

- App Router com estrutura limpa;
- configuracao centralizada para futura API;
- mocks locais para nao travar o produto;
- painel do lojista com formulario e preview;
- home publica funcional.

Os gaps que ainda precisamos resolver com mais clareza sao:

- consolidar as paginas publicas principais;
- amadurecer o onboarding do lojista;
- estruturar a vitrine com filtros e descoberta;
- definir a entrada do painel administrativo;
- manter a documentacao alinhada com a fase real do projeto;
- comunicar melhor que parceiros sao as lojas da plataforma;
- detalhar melhor as entidades e seus campos de cadastro;
- tratar estoque, pedidos e vendas como nucleo do painel da loja;
- definir filtros basicos de relatorios para lojista e admin;
- garantir categorias isoladas por loja com base padrao inicial.

## Objetivo desta fase

Consolidar o frontend publico e operacional para provar cinco coisas antes da API:

1. o lojista entende a proposta em poucos segundos;
2. a vitrine transmite confianca e organizacao;
3. o painel permite testar o fluxo de cadastro real;
4. o admin tem uma visao clara da operacao geral;
5. o time sabe exatamente qual tela vem antes da integracao backend.

## Modulos centrais do produto

### 1. Area publica

Responsavel por apresentar a proposta da plataforma e gerar entrada para lojistas e clientes.

Entregas esperadas:

- home com proposta comercial clara;
- menu superior forte para desktop e mobile;
- CTA para cadastro de loja;
- CTA para login;
- secao de lojas parceiras cadastradas;
- vitrine com destaque de lojas e produtos.

### 2. Painel do lojista

Responsavel pela operacao comercial da loja.

Entregas esperadas:

- cadastro e edicao da loja;
- cadastro de categorias;
- cadastro de produtos;
- controle de imagens com preview;
- controle de estoque e precificacao;
- controle de pedidos;
- leitura de vendas da loja;
- relatorios com filtros por periodo e categoria.

### 3. Painel administrativo

Responsavel pela visao macro da operacao da plataforma.

Metricas prioritarias para o dashboard admin:

- total de lojas cadastradas;
- total geral de produtos;
- total geral de pedidos;
- total geral de clientes;
- vendas do dia;
- vendas da semana;
- vendas do mes.

Refinacao recomendada para este modulo:

- separar metricas por cards principais no topo;
- ter uma area de comparativo por periodo;
- exibir status rapido de crescimento ou queda;
- permitir filtro por lojista;
- permitir leitura de vendas, pedidos e cadastros por periodo.

### 4. Jornada do cliente

Responsavel pela descoberta, compra e acompanhamento.

Entregas esperadas:

- pagina publica da loja;
- pagina de produto;
- busca e filtros;
- carrinho;
- checkout;
- historico de pedidos.

## Sequencia recomendada do e-commerce

### Fase 1 - Home publica forte

Objetivo: transformar a pagina inicial em uma entrada comercial clara.

Entregas:

- menu superior responsivo com boa leitura no desktop;
- navegacao centralizada e moderna;
- CTA para `Cadastrar-se como loja`;
- CTA para `Login`;
- secao de `Lojas parceiras`;
- bloco explicando como a plataforma funciona;
- reforco visual da vitrine e do valor para o lojista.

Resultado esperado:

- qualquer visitante entende o que e a Hierarquia;
- o lojista sabe qual botao clicar;
- o visitante entende que as parceiras sao as lojas cadastradas;
- o projeto comeca a parecer um produto e nao apenas uma base tecnica.

### Fase 2 - Onboarding do lojista

Objetivo: estruturar a entrada do lojista no sistema.

Entregas:

- pagina dedicada de cadastro de loja;
- pagina de login com visual consistente;
- formulario de dados da loja;
- validacoes de campos no frontend;
- confirmacao visual de sucesso.

Resultado esperado:

- fluxo de entrada do lojista validado antes da API;
- base pronta para depois ligar autenticacao e persistencia.

### Fase 3 - Catalogo da loja e operacao central

Objetivo: amadurecer o nucleo comercial e operacional da loja.

Entregas:

- cadastro e listagem de categorias;
- cadastro, edicao e remocao visual de produtos;
- cards de produto consistentes;
- status de estoque;
- estoque minimo e alerta de reposicao;
- historico de movimentacao de estoque;
- selecao de categoria existente no cadastro do produto;
- acao rapida para adicionar categoria no momento do cadastro;
- pagina da loja com seus produtos.

Resultado esperado:

- o frontend passa a refletir a operacao principal do negocio;
- o lojista enxerga estoque real e risco de ruptura;
- o payload da API fica mais facil de definir porque a interface ja pediu os dados certos.

### Fase 4 - Vitrine e descoberta

Objetivo: melhorar a experiencia do cliente final.

Entregas:

- listagem de lojas com filtros;
- pagina publica de loja;
- pagina de produto;
- busca por nome, categoria e loja;
- destaques, lancamentos e campanhas;
- organizacao visual para mobile e desktop.

Resultado esperado:

- jornada publica pronta para navegacao real;
- usuarios conseguem descobrir produtos sem depender do backend finalizado.

### Fase 5 - Carrinho, pedido e checkout frontend-first

Objetivo: validar a compra completa sem ainda depender da API real.

Entregas:

- carrinho lateral ou pagina dedicada;
- resumo de itens;
- alteracao de quantidade;
- retirada ou entrega;
- bloco de endereco;
- resumo financeiro;
- tela de confirmacao do pedido;
- fluxo de Pix manual no MVP;
- status inicial de pedido apos compra.

Resultado esperado:

- o time prova a jornada ponta a ponta;
- pedido passa a alimentar o desenho de estoque e vendas;
- a API futura pode ser desenhada em cima de um checkout ja testado.

### Fase 6 - Painel da loja, pedidos, vendas e admin

Objetivo: expandir a gestao depois que a base comercial estiver consolidada.

Entregas:

- dashboard da loja com estoque baixo, pedidos pendentes e vendas do periodo;
- relatorios do lojista por dia, semana, mes e categoria;
- dashboard admin com indicadores gerais;
- total de lojas, produtos, pedidos e clientes;
- vendas por dia, semana e mes;
- filtros admin por lojista e periodo;
- historico do cliente;
- estados de loading, erro e vazio em todos os modulos;
- componentes reaproveitaveis para tabelas, cards e formularios.

Resultado esperado:

- produto com cara de sistema operacional real;
- visao macro para tomada de decisao;
- terreno preparado para integracao de autenticao e autorizacao.

### Fase 7 - API e persistencia

Objetivo: conectar o que ja foi validado visualmente.

Entregas:

- substituir mocks por servicos reais gradualmente;
- ligar autenticacao;
- persistir loja, categorias, produtos e pedidos;
- persistir movimentos de estoque e vendas;
- suportar consultas filtradas para lojista e admin;
- adicionar tratamento de erros da API;
- revisar contratos de dados com base nos fluxos ja aprovados.

Resultado esperado:

- menos retrabalho;
- backend servindo uma UX que ja foi provada.

## Backlog pratico por prioridade

### Sprint 1 - Entrada publica e navegacao

Telas:

- home publica refinada;
- pagina de lojas parceiras;
- pagina de login;
- pagina de cadastro de loja.

Componentes:

- `site-header`
- `hero-home`
- `cta-group`
- `partner-strip`
- `section-heading`

Objetivos tecnicos:

- padronizar header e navegacao;
- consolidar CTAs principais;
- criar base visual consistente para paginas publicas;
- comunicar que parceiros sao lojas participantes.

Criterio de pronto:

- todas as paginas publicas principais abertas por rota;
- navegacao desktop e mobile consistente;
- CTA principal sempre visivel;
- secao de parceiros claramente associada a lojas cadastradas.

### Sprint 2 - Onboarding do lojista

Telas:

- cadastro da loja;
- login do lojista;
- tela de confirmacao de cadastro;
- estado vazio inicial do painel.

Componentes:

- `auth-card`
- `store-profile-form`
- `form-section`
- `empty-state`
- `status-badge`

Objetivos tecnicos:

- estruturar formularios reutilizaveis;
- validar campos principais da loja;
- preparar payload visual para futura API.

Criterio de pronto:

- fluxo de cadastro navegavel do inicio ao fim;
- validacoes funcionando no frontend;
- consistencia visual entre login e cadastro.

### Sprint 3 - Catalogo, categorias e estoque do lojista

Telas:

- dashboard inicial do lojista;
- cadastro de categoria;
- listagem de categorias;
- cadastro de produto;
- listagem de produtos;
- tela de estoque e alertas.

Componentes:

- `seller-dashboard-header`
- `category-form`
- `category-list`
- `product-card`
- `image-upload-preview`
- `stock-alert-card`
- `stock-movement-table`
- `category-picker`

Objetivos tecnicos:

- amadurecer o painel do lojista;
- separar blocos de formulario por dominio;
- melhorar a manutencao dos componentes do catalogo;
- estruturar a leitura de estoque como parte do painel principal;
- garantir CRUD individual de categoria por lojista;
- permitir categorias base padrao e criacao rapida de categoria no fluxo do produto.

Criterio de pronto:

- lojista consegue criar e revisar loja, categorias e produtos em fluxo local;
- lojista consegue ver estoque atual, minimo e alertas;
- categoria de um lojista nao impacta outra loja;
- formulario de produto permite selecionar categoria existente ou adicionar nova.

### Sprint 4 - Vitrine e descoberta

Telas:

- listagem publica de lojas;
- pagina publica da loja;
- listagem de produtos da loja;
- detalhe do produto;
- busca com filtros.

Componentes:

- `store-card`
- `product-card`
- `filter-bar`
- `search-input`
- `product-gallery`

Objetivos tecnicos:

- estruturar navegacao publica do cliente;
- conectar busca, filtro e organizacao visual;
- tornar a descoberta mais forte em mobile e desktop.

Criterio de pronto:

- usuario consegue navegar da home ate o produto com clareza;
- filtros e busca funcionam localmente com mocks.

### Sprint 5 - Carrinho, pedido e checkout

Telas:

- carrinho;
- resumo do pedido;
- entrega ou retirada;
- checkout;
- confirmacao.

Componentes:

- `cart-sheet`
- `cart-item`
- `order-summary`
- `checkout-form`
- `payment-instructions`
- `order-status-badge`

Objetivos tecnicos:

- validar a jornada completa de compra;
- preparar estados de resumo financeiro;
- desenhar o fluxo do Pix manual no MVP;
- iniciar a base visual de status de pedido.

Criterio de pronto:

- compra ponta a ponta navegavel no frontend;
- estados vazio, preenchido e confirmado funcionando;
- estrutura de pedido pronta para alimentar loja, estoque e vendas.

### Sprint 6 - Painel da loja, relatorios e admin

Telas:

- tela de pedidos da loja;
- dashboard da loja;
- relatorio da loja;
- login admin;
- dashboard admin;
- relatorio admin;
- pagina de visao geral;
- listagem resumida de lojas e pedidos.

Componentes:

- `admin-metric-card`
- `dashboard-summary-grid`
- `period-filter`
- `growth-indicator`
- `admin-table-preview`
- `order-table`
- `sales-summary-card`
- `category-report-filter`
- `seller-report-filter`

Objetivos tecnicos:

- apresentar a operacao geral em cards de alto impacto;
- criar leitura rapida por periodo;
- estruturar a visao de pedidos e vendas da loja;
- adicionar filtros de relatorio para lojista e admin;
- preparar terreno para filtros reais no backend depois.

Criterio de pronto:

- dashboard admin mostra metricas principais com clareza;
- loja enxerga pedidos, estoque critico e vendas do periodo;
- relatorio da loja filtra por dia, semana, mes e categoria;
- relatorio do admin filtra por lojista, pedidos, vendas, cadastros e periodo.

## Ordem pratica de implementacao imediata

Se continuarmos focando no frontend agora, eu seguiria esta ordem curta:

1. home publica e navegacao;
2. cadastro e login do lojista;
3. categorias da loja com base padrao inicial;
4. cadastro de produto e estrutura de estoque;
5. pagina publica da loja;
6. listagem e detalhe de produto;
7. filtros e busca;
8. carrinho;
9. checkout e status inicial de pedido;
10. painel da loja com pedidos, estoque e vendas;
11. relatorios do lojista;
12. painel admin com filtros por lojista e periodo;
13. integracao com API.

## Ambiente de desenvolvimento

Para ambiente local, podemos sim prever um acesso administrativo default, mas com uma regra importante: isso deve existir apenas como configuracao de desenvolvimento e nunca como credencial fixa exposta em producao.

Sugestao de variaveis para `.env`:

- `ADMIN_DEFAULT_EMAIL=admin@99dev.pro`
- `ADMIN_DEFAULT_PASSWORD=123123@`

Regra recomendada:

- usar somente em ambiente local ou seed de desenvolvimento;
- nao tratar essa credencial como conta real de producao;
- depois substituir por fluxo de autenticacao e gerenciamento seguro de usuarios.

## Melhorias de UX que valem manter como regra

- sempre ter CTA principal e CTA secundario nas telas chave;
- evitar paginas com texto muito tecnico na area publica;
- manter menu de desktop bem distribuido e menu mobile simples;
- dar contexto visual para lojista, cliente e parceiro;
- validar estados vazio, carregando e erro desde cedo;
- construir componentes reaproveitaveis antes de espalhar estilos.

## Componentes recomendados para criar na proxima etapa

- `site-header`
- `hero-home`
- `partner-strip`
- `store-card`
- `product-card`
- `section-heading`
- `empty-state`
- `status-badge`
- `cta-group`
- `admin-metric-card`
- `dashboard-summary-grid`
- `stock-alert-card`
- `stock-movement-table`
- `order-table`
- `sales-summary-card`
- `category-picker`
- `category-report-filter`
- `seller-report-filter`

## Definicao de pronto para sair do frontend e ir para API

So vale iniciar a fase forte de API quando estes pontos estiverem resolvidos:

- home e paginas publicas com proposta clara;
- onboarding do lojista navegavel;
- cadastro de loja e produto coerentes;
- CRUD de categorias isolado por loja;
- vitrine e produto com boa leitura responsiva;
- carrinho e checkout testados visualmente;
- painel da loja com estoque, pedidos e vendas desenhado;
- relatorios do lojista com filtros por periodo e categoria;
- dashboard admin com metricas principais e filtro por lojista desenhado;
- estrutura de componentes estabilizada;
- contratos de dados inferidos com pouca incerteza.

## Resumo executivo

O Hierarquia ja tem uma base promissora. O melhor caminho agora nao e correr para o backend, e sim fechar a experiencia principal do frontend ate que a jornada do lojista, do cliente e do administrador esteja clara, bonita e consistente.

Principalmente, a loja precisa conseguir operar seu negocio com tres controles muito bem definidos: estoque, pedidos e vendas.

Tambem precisamos garantir duas bases operacionais simples e obrigatorias: relatorios filtraveis e categorias isoladas por lojista com apoio de categorias padrao iniciais.

Quando isso acontecer, a API deixa de ser uma aposta e vira apenas a camada que conecta algo que ja funciona como produto.

## Status real do frontend antes da API

### O que ja esta validado no projeto

- home publica com navegacao centralizada e CTA para lojista;
- pagina de login;
- pagina de cadastro de loja;
- pagina de lojas parceiras;
- vitrine publica por loja;
- pagina publica de produto;
- carrinho visual por loja;
- checkout visual com cliente, endereco e resumo;
- tela final de pedido confirmado;
- painel do lojista com categorias, produtos, estoque, pedidos e vendas;
- painel admin com filtros por periodo e lojista.

### O que ainda falta antes de irmos para API

#### 1. Refinar UX e consistencia do fluxo publico

Ainda precisamos:

- revisar textos, hierarquia visual e CTAs do fluxo publico completo;
- melhorar estados de vazio, carregando e erro nas paginas publicas;
- padronizar melhor feedback visual entre carrinho, checkout e pedido confirmado;
- revisar responsividade fina em mobile e desktop em todas as etapas.

#### 2. Fechar melhor busca, filtros e descoberta

Ainda precisamos:

- criar busca publica real por nome de loja, categoria e produto;
- adicionar filtros visuais na vitrine publica;
- melhorar descoberta por categoria dentro da loja;
- preparar organizacao para destaques, lancamentos e campanhas.

#### 3. Evoluir o painel do lojista para operacao mais completa

Ainda precisamos:

- criar tela dedicada de pedidos da loja;
- refinar tela dedicada de estoque e movimentacoes;
- melhorar visual de vendas e indicadores do periodo;
- criar estados mais claros para pedido, pagamento e ruptura de estoque;
- revisar o fluxo de edicao da loja como modulo proprio.

#### 4. Refinar relatorios do lojista e admin

Ainda precisamos:

- fortalecer visualmente os relatorios por dia, semana e mes;
- melhorar leitura por categoria no painel do lojista;
- deixar o admin com leitura mais clara de cadastros, pedidos e vendas;
- organizar melhor comparativos por lojista no dashboard admin.

#### 5. Consolidar componentes e contratos de interface

Ainda precisamos:

- extrair mais blocos reutilizaveis para header, cards, tabelas e filtros;
- reduzir repeticao visual nas paginas publicas e operacionais;
- estabilizar nomes, campos e estruturas que ja servirao de contrato para a API;
- revisar README e plano sempre que uma fase importante for concluida.

## Sequencia sugerida para continuar amanha

1. revisar UX do fluxo publico completo: loja, produto, carrinho, checkout e pedido confirmado;
2. criar busca e filtros da vitrine publica;
3. abrir tela dedicada de pedidos da loja;
4. abrir tela dedicada de estoque e movimentacoes;
5. refinar relatorios do lojista;
6. refinar relatorios e leitura do admin;
7. consolidar componentes reutilizaveis;
8. so depois iniciar desenho final da API.

## Ponto de retomada para amanha

Quando retomarmos, o melhor ponto de entrada e este:

- revisar a jornada publica completa no frontend;
- ajustar detalhes de UX, textos e navegacao;
- depois partir para busca, filtros e descoberta;
- em seguida voltar ao painel do lojista para pedidos e estoque dedicados.

## Checklist final antes da API

So devemos seguir para API quando estes pontos estiverem realmente confortaveis no frontend:

- jornada publica completa navegavel e coerente;
- busca e filtros publicos funcionando localmente;
- painel do lojista com pedidos, estoque e vendas bem resolvidos;
- relatorios do lojista com leitura clara por periodo e categoria;
- painel admin com leitura clara por lojista e periodo;
- componentes principais estabilizados;
- campos das entidades sem grande duvida de modelagem;
- plano e README refletindo o estado real do produto.
