# Plano de evolucao do Hierarquia

## Visao do produto

O Hierarquia sera um e-commerce multiloja com foco inicial em moda, pensado para conectar lojas, catalogos, parceiros e pedidos em uma experiencia simples de navegar e operar.

A decisao atual do projeto e correta: primeiro validar frontend, navegacao, proposta comercial e fluxo de operacao. A API entra depois, quando a interface ja estiver madura o bastante para evitar retrabalho.

## Diagnostico atual do projeto

Hoje a base ja possui bons fundamentos:

- App Router com estrutura limpa;
- configuracao centralizada para futura API;
- mocks locais para nao travar o produto;
- painel do lojista com formulario e preview;
- home publica funcional.

Mas ainda havia alguns gaps de produto e interface:

- faltava um menu superior mais forte para desktop web;
- a home estava mais tecnica do que comercial;
- o caminho principal do usuario nao estava explicito;
- README e plano ainda nao refletiam a prioridade real do projeto;
- a sequencia do e-commerce precisava ficar mais objetiva.

## Objetivo desta fase

Consolidar o frontend publico e operacional para provar quatro coisas antes da API:

1. o lojista entende a proposta em poucos segundos;
2. a vitrine transmite confianca e organizacao;
3. o painel permite testar o fluxo de cadastro real;
4. o time sabe exatamente qual tela vem antes da integracao backend.

## Sequencia recomendada do e-commerce

### Fase 1 - Home publica forte

Objetivo: transformar a pagina inicial em uma entrada comercial clara.

Entregas:

- menu superior responsivo com boa leitura no desktop;
- navegacao centralizada e moderna;
- CTA para `Cadastrar-se como loja`;
- CTA para `Login`;
- secao `Nossos parceiros`;
- bloco explicando como a plataforma funciona;
- reforco visual da vitrine e do valor para o lojista.

Resultado esperado:

- qualquer visitante entende o que e a Hierarquia;
- o lojista sabe qual botao clicar;
- o projeto comeca a parecer um produto e nao apenas uma base tecnica.

### Fase 2 - Onboarding do lojista

Objetivo: estruturar a entrada do lojista no sistema.

Entregas:

- pagina dedicada de cadastro de loja;
- pagina de login com visual consistente;
- formulario de dados da loja;
- captura de nome, CNPJ, WhatsApp, Pix e endereco;
- validacoes de campos no frontend;
- confirmacao visual de sucesso.

Resultado esperado:

- fluxo de entrada do lojista validado antes da API;
- base pronta para depois ligar autenticacao e persistencia.

### Fase 3 - Catalogo da loja

Objetivo: amadurecer o nucleo comercial.

Entregas:

- cadastro e listagem de categorias;
- cadastro, edicao e remocao visual de produtos;
- cards de produto consistentes;
- status de estoque;
- precos varejo, atacado e promocional;
- galeria de imagens mais polida;
- pagina da loja com seus produtos.

Resultado esperado:

- o frontend passa a refletir a operacao principal do negocio;
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

### Fase 5 - Carrinho e checkout frontend-first

Objetivo: validar a compra completa sem ainda depender da API real.

Entregas:

- carrinho lateral ou pagina dedicada;
- resumo de itens;
- alteracao de quantidade;
- retirada ou entrega;
- bloco de endereco;
- resumo financeiro;
- tela de confirmacao do pedido;
- fluxo de Pix manual no MVP.

Resultado esperado:

- o time prova a jornada ponta a ponta;
- a API futura pode ser desenhada em cima de um checkout ja testado.

### Fase 6 - Painel operacional completo

Objetivo: expandir a area logada depois que a base comercial estiver consolidada.

Entregas:

- dashboard do lojista com pedidos;
- historico do cliente;
- indicadores administrativos;
- estados de loading, erro e vazio em todos os modulos;
- componentes reaproveitaveis para tabelas, cards e formularios.

Resultado esperado:

- produto com cara de sistema operacional real;
- terreno preparado para integracao de autenticao e autorizacao.

### Fase 7 - API e persistencia

Objetivo: conectar o que ja foi validado visualmente.

Entregas:

- substituir mocks por servicos reais gradualmente;
- ligar autenticacao;
- persistir loja, categorias, produtos e pedidos;
- adicionar tratamento de erros da API;
- revisar contratos de dados com base nos fluxos ja aprovados.

Resultado esperado:

- menos retrabalho;
- backend servindo uma UX que ja foi provada.

## Ordem pratica de implementacao imediata

Se continuarmos focando no frontend agora, eu seguiria esta ordem curta:

1. home publica e navegacao;
2. cadastro e login;
3. pagina publica da loja;
4. listagem e detalhe de produto;
5. filtros e busca;
6. carrinho;
7. checkout;
8. area de pedidos;
9. integracao com API.

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

## Definicao de pronto para sair do frontend e ir para API

So vale iniciar a fase forte de API quando estes pontos estiverem resolvidos:

- home e paginas publicas com proposta clara;
- onboarding do lojista navegavel;
- cadastro de loja e produto coerentes;
- vitrine e produto com boa leitura responsiva;
- carrinho e checkout testados visualmente;
- estrutura de componentes estabilizada;
- contratos de dados inferidos com pouca incerteza.

## Resumo executivo

O Hierarquia ja tem uma base promissora. O melhor caminho agora nao e correr para o backend, e sim fechar a experiencia principal do frontend ate que a jornada do lojista e do cliente esteja clara, bonita e consistente.

Quando isso acontecer, a API deixa de ser uma aposta e vira apenas a camada que conecta algo que ja funciona como produto.
