# Hierarquia - Plataforma Multiloja Preparada para API

## Visao Geral

O projeto Hierarquia sera uma plataforma de catalogo online multiloja voltada para lojas de roupas, com foco em crescimento por fases e integracao desacoplada com API.

A proposta desta base inicial e:

- organizar o dominio do negocio desde o comeco;
- separar configuracoes de ambiente da interface;
- permitir trocar a origem dos dados apenas ajustando o `.env`;
- preparar o frontend para ser testado antes da API existir.

## Objetivo do Produto

Criar uma plataforma onde:

- lojistas cadastram suas lojas e produtos com facilidade;
- clientes navegam, pesquisam e fazem pedidos rapidamente;
- pedidos avancam por um fluxo claro de atendimento;
- a aplicacao possa receber dados de API externa sem retrabalho estrutural.

## Principio de Construcao Atual

A prioridade desta fase e um frontend testavel sem dependencia imediata de backend.

Isso significa:

- usar mocks locais para validar fluxos e usabilidade;
- centralizar a futura conexao com API na camada de servicos;
- construir telas ja pensadas para dados reais;
- reduzir retrabalho quando a integracao oficial entrar.

## Perfis Principais

### Administrador

- gerencia lojas, clientes e pedidos;
- acompanha metricas e relatorios;
- supervisiona o funcionamento geral da plataforma.

### Lojista

- cadastra e edita sua loja;
- gerencia categorias e produtos;
- acompanha pedidos recebidos;
- configura Pix, WhatsApp e informacoes operacionais.

### Cliente

- navega entre lojas e produtos;
- pesquisa itens por nome e categoria;
- monta carrinho e finaliza pedidos;
- acompanha historico e status.

## Stack Inicial

- Next.js App Router
- TypeScript
- Tailwind CSS
- futura integracao com Prisma e PostgreSQL
- futura autenticacao por perfis
- futura integracao com API externa para catalogo e pedidos

## Estrutura Tecnica Sugerida

```bash
src/
  app/
    (public)/
    (auth)/
    (lojista)/
    (cliente)/
    (admin)/
    painel-lojista/
  components/
  lib/
    config.ts
    mock-data.ts
    services/
  types/
```

## Estrategia de Integracao com API

A integracao com API deve ficar centralizada e configuravel por ambiente.

### Variaveis previstas no `.env`

- URL publica do app
- URL base da API
- endpoints de auth, lojas, categorias, produtos e pedidos
- timeout de requisicao
- token de autenticacao server-to-server
- chave para ativar mocks locais

### Regra de implementacao

- a interface nao deve conhecer URLs fixas da API;
- todos os endpoints devem sair da camada central de configuracao;
- a camada de servicos deve decidir entre mock local e API real;
- recursos futuros devem reutilizar o mesmo padrao.

## Modulos do Sistema

### 1. Autenticacao

- login e cadastro
- controle por `role`
- protecao de rotas

### 2. Lojas

Campos:

- nome
- CNPJ
- foto de capa
- WhatsApp
- chave Pix
- endereco via CEP

### 3. Categorias

- nome
- slug
- loja vinculada
- status ativo ou inativo

### 4. Produtos

- nome
- descricao
- imagens
- categoria
- preco varejo
- preco atacado
- preco promocional
- estoque

#### Regras de imagens no cadastro do lojista

- cada produto deve ter no minimo 1 imagem;
- cada produto pode ter no maximo 5 imagens;
- o lojista pode adicionar imagens por upload local;
- o lojista pode adicionar imagens por URL;
- toda imagem precisa aparecer com preview imediato;
- o lojista deve conseguir remover imagens antes de salvar;
- a primeira imagem funciona como capa principal no preview.

#### Experiencia esperada no painel do lojista

- formulario simples e direto, sem excesso de passos;
- precificacao organizada por varejo, atacado e promocional;
- categoria e estoque visiveis no mesmo bloco de cadastro;
- area de imagens separada, com status claro da quantidade ja usada;
- preview lateral para o lojista revisar como o produto sera exibido.

### 5. Vitrine Publica

- home com lista de lojas
- pagina da loja
- pagina do produto
- busca global

### 6. Carrinho e Pedido

Fluxo:

1. cliente adiciona produtos
2. define quantidade
3. escolhe entrega ou retirada
4. confirma dados
5. gera pedido

### 7. Pagamento

- Pix manual no MVP
- QR Code Pix em fase posterior
- futura automacao por API

### 8. Pos-pedido

- geracao de PDF
- resumo para WhatsApp
- historico de acompanhamento

### 9. Paineis

#### Painel do lojista

- dashboard operacional com indicadores locais ou reais;
- cadastro de produtos testavel sem API;
- upload de fotos por arquivo e URL com preview;
- formulario preparado para virar payload de API depois;
- validacoes visuais antes da persistencia real.

#### Painel do cliente

- historico de pedidos
- status dos pedidos
- repeticao de compra

#### Painel administrativo

- indicadores gerais
- gestao de lojas
- gestao de clientes
- gestao de pedidos

## Fases de Desenvolvimento

### Fase 1 - Fundacao visual e tecnica

- limpar boilerplate inicial
- estruturar ambiente
- configurar camada central para API
- definir tipos basicos do dominio
- disponibilizar mocks para frontend testavel

### Fase 2 - Painel do lojista primeiro

- construir cadastro amigavel de produtos
- implementar preview com imagens locais e remotas
- validar regras de 1 a 5 imagens por produto
- organizar servicos para futura persistencia na API

### Fase 3 - Dominio comercial

- modelar lojas, categorias e produtos em profundidade
- criar servicos de leitura da API
- preparar componentes de listagem e detalhes

### Fase 4 - Fluxo de pedido

- carrinho
- checkout
- endereco e frete
- criacao do pedido

### Fase 5 - Operacao completa

- autenticacao por perfil
- painel do lojista conectado a backend
- painel do cliente
- painel admin

### Fase 6 - Expansao

- pagamento automatizado
- notificacoes
- cupons
- analytics

## MVP Inicial

- cadastro de lojista
- cadastro da loja
- produtos e categorias
- vitrine publica
- carrinho
- pedido
- Pix manual
- painel do lojista
- fluxo de imagens com preview no cadastro de produto

## Regras de Negocio Iniciais

### Loja

- deve ter Pix e WhatsApp
- deve possuir endereco valido

### Produto

- pertence a uma loja
- deve ter estoque controlado
- preco promocional e opcional
- deve possuir de 1 a 5 imagens no cadastro

### Pedido

- precisa ter ao menos um item
- exige endereco quando for entrega
- retirada nao cobra frete

## Observacoes Praticas

- comecar pelo fluxo principal antes das automacoes;
- manter a API desacoplada da camada visual;
- validar usabilidade com mocks antes da integracao real;
- documentar variaveis de ambiente antes de integrar servicos reais;
- evoluir cada painel com base no fluxo mais critico do usuario.