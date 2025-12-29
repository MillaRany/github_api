 # GitHub API - Projeto

## Setup do projeto

- Pré-requisitos: `node` (>=16), `npm` ou `pnpm`.
- Clone o repositório e instale dependências:

```bash

# Backend
cd backend
npm install

# Inicializar DB (seed padrão cria usuário admin)
npm run init-db

# Rodar em dev
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev


```

Também é possível subir a aplicação com Docker através do alvo `make up` (é necessário ter Docker e docker-compose instalados):

```bash
# Requer Docker e docker-compose
make up

# Para parar e remover os containers
make down
```

Variáveis de ambiente importantes (backend):
- `JWT_SECRET` — obrigatório (token signing).
- `JWT_EXPIRES_IN` — opcional (ex: `30m`).
- `GITHUB_TOKEN` — opcional (melhora rate limit das chamadas ao GitHub).
- `DATABASE_PATH` — opcional (path para o arquivo SQLite).

 # GitHub API - Projeto

## Setup do projeto

- Pré-requisitos: `node` (>=16), `npm` ou `pnpm`.
- Clone o repositório e instale dependências:

```bash
git clone <repo-url>
cd github_api

# Backend
cd backend
npm install

# Inicializar DB (seed padrão cria usuário admin)
npm run init-db

# Rodar em dev
npm run dev

# Em outra aba: Frontend
cd ../frontend
npm install
npm run dev
```

Também é possível subir a aplicação com Docker através do alvo `make up` (é necessário ter Docker e docker-compose instalados):

```bash
# Requer Docker e docker-compose
make up

# Para parar e remover os containers
make down
```

Variáveis de ambiente importantes (backend):
- `JWT_SECRET` — obrigatório (token signing).
- `JWT_EXPIRES_IN` — opcional (ex: `30m`).
- `GITHUB_TOKEN` — opcional (melhora rate limit das chamadas ao GitHub).
- `DATABASE_PATH` — opcional (path para o arquivo SQLite).

## Usuários seed

O projeto inclui um seed/init para facilitar testes locais. Após executar `npm run init-db` no `backend`, dois usuários serão criados por padrão:

- **Admin**
  - **Email:** admin@example.com
  - **Senha:** admin123

- **Usuário comum**
  - **Email:** user@example.com
  - **Senha:** user123

## Decisões técnicas

- Injeção de dependência: **tsyringe** para desacoplamento e testabilidade.
- Validação: **Zod** (esquemas e middleware de validação para `body`, `params`, `query`).
- Persistência: **SQLite** (leve e simples para PoC/development). Decisão de NÃO usar ORM inicialmente para manter o projeto leve e transparente; queries diretas + adapters via interfaces.
- Autenticação: **JWT** (senha com `bcryptjs`).
- Cliente HTTP: **axios** encapsulado em `infrastructure/httpClient` para chamadas ao GitHub.
- Testes: **Jest** com estrutura para unit tests; recomenda-se focar em `application` e `controllers` com mocks de interfaces.

Decisões adicionais e motivação técnica:

- Adotar **Zod** de forma sistemática para evitar erros por inputs mal formados: todos os contratos de entrada devem ter schemas em `backend/src/schemas` e serem aplicados via middleware (`validateBody`, `validateParams`, `validateQuery`). Isso reduz bugs por contrato inválido e facilita respostas de erro padronizadas.
- **Manter Clean Architecture** — separar responsabilidades entre `controllers`, `application` (casos de uso) e `models` (persistência). Comunicar entre camadas apenas por **interfaces**/contratos (ex.: `IUserModel`, `IHttpClient`) para evitar que camadas conheçam implementações concretas. Isso facilita testes e evolução do projeto.
- **Testes unitários com foco em edge cases**: priorizar testes que cubram situações difíceis de reproduzir manualmente (ex.: rate-limit do GitHub, respostas faltando campos, erros parciais, falhas de IO do DB, conflitos UNIQUE). Usar mocks/spies nas interfaces para isolar e garantir comportamento correto da camada `application`.
- **Decisão sobre ORM:** optar por **não usar ORM** no início para manter o projeto leve e de fácil compreensão. Embora a introdução de um ORM (Prisma/TypeORM) possa trazer benefícios a médio prazo, a migração posterior exigirá trabalho adicional nas queries e na adaptação das interfaces — por isso a escolha de mantê-lo fora do escopo inicial.

## Pontos de melhoria (priorizados)

1. Segurança e configuração
   - Validar e exigir `JWT_SECRET` no startup; falhar com mensagem clara se ausente.
   - Mover fluxo de sessão no frontend para cookie `HttpOnly, Secure, SameSite` ou implementar refresh tokens.
   - Não logar secrets (`GITHUB_TOKEN`, senhas).

2. Validação e robustez
   - Cobrir todos os endpoints com esquemas Zod (`body`, `params`, `query`).
   - Retornar erros padronizados com detalhes dos erros de validação.

3. Resiliência e performance
   - Implementar retry/exponential backoff para chamadas ao GitHub e respeitar `Retry-After`/rate-limit headers.
   - Cachear respostas externas (in-memory ou Redis) com TTL para reduzir chamadas repetidas.
   - Adicionar rate limiting em endpoints sensíveis (login, criação de recursos) com `express-rate-limit`.
   - Aplicar circuit breaker (ex.: `opossum`) para evitar falhas em cascata.

4. Testes e CI
   - Adicionar testes de integração (rotas principais) e e2e (Cypress/Playwright).
   - Cobrir edge cases: responses parciais do GitHub, rate limit 429, falhas IO do DB, conflitos UNIQUE.
   - Pipeline CI (GitHub Actions) com lint, type-check, testes e coverage gating.

5. Banco de dados e migrações
   - Documentar `DATABASE_PATH` e adicionar ferramenta de migrations (ex.: `knex`, `umzug`) se o projeto crescer.

## Melhorias no Frontend (recomendações)

As seguintes melhorias e decisões são recomendadas para o frontend; coloquei ações imediatas e de médio prazo:

- **Autenticação e segurança**: use cookies `HttpOnly, Secure, SameSite` para sessões em vez de `localStorage`. Planeje um fluxo de refresh token no backend e trate `401` via interceptor do `axios`.

- **HTTP client centralizado**: mantenha `src/api/axios.ts` com interceptors para anexar token, tratar 401 (refresh/logout) e implementar retries/backoff para chamadas externas.

- **Validação de formulários**: adote `zod` em formulários críticos (login, criação de usuário) para evitar requisições com dados mal formados.

- **Gerenciamento de estado e tipos**: organize `Pinia` stores por domínio (auth, users, ui) e compartilhe tipos TypeScript com o backend (OpenAPI / geração de tipos) para evitar inconsistências.

- **Performance e UX**: habilite lazy-loading de rotas e code-splitting com Vite; padronize mensagens de erro/loading e trate rate-limit com avisos apropriados ao usuário.

- **Testes e observability**: adicione testes unitários para componentes críticos, e2e (Cypress/Playwright) para fluxos principais e instrumente erros com Sentry/LogRocket em produção.

Pequenas ações imediatas (quick wins):

- Criar `src/api/axios.ts` com interceptor para 401 e anexar token.
- Migrar armazenamento de token para cookie HttpOnly (coordenar backend).
- Adicionar `zod` em formulários de `LoginView` e `UsersView`.
