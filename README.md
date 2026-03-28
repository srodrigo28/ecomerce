# Hierarquia

Projeto em Next.js preparado para evoluir para uma plataforma de catalogo multiloja. Nesta etapa a base foi organizada para receber dados de uma API externa sem acoplar a interface a caminhos fixos.

## O que ja esta pronto

- Estrutura inicial em Next.js com App Router e TypeScript.
- Home inicial substituindo o boilerplate padrao.
- Configuracao central de ambiente em `src/lib/config.ts`.
- Variaveis de API documentadas em `.env` e `.env.example`.
- Tipos iniciais de dominio em `src/types/catalog.ts`.

## Variaveis de ambiente

Preencha os valores em `.env` antes de integrar a API real.

Principais grupos:

- Dados publicos do app.
- URL base da API.
- Endpoints desacoplados por recurso.
- Timeout de requisicao.
- Token privado para comunicacao server-to-server.
- Alternancia de mocks locais.

## Como rodar

```bash
npm run dev
```

Aplicacao local padrao:

```text
http://localhost:3000
```

## Proximos passos sugeridos

- Criar camada de servicos para consumo real da API.
- Definir schema de autenticacao e perfis.
- Implementar listagem de lojas e produtos com dados reais.
- Adicionar estados de loading, erro e vazio por modulo.
- Evoluir para dashboard de lojista, cliente e admin.