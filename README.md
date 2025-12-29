# GitHub API - Projeto

## Pré-requisitos

### Para desenvolvimento local:
- **Node.js** >= 18 (recomendado: >= 20 LTS)

### Para Docker (opcional):
- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Make** (opcional, para usar `make up`)

Variáveis de ambiente importantes (backend):
- `JWT_SECRET` — obrigatório (token signing).
- `JWT_EXPIRES_IN` — opcional (ex: `30m`) default: `30m`.
- `GITHUB_TOKEN` — opcional (melhora rate limit das chamadas ao GitHub).
- `DATABASE_PATH` — opcional (path para o arquivo SQLite, ja setado).

**Frontend:**
- `VITE_API_URL` — opcional (URL da API) default: `http://localhost:3000/api`


## Setup do projeto

- Clone o repositório e instale dependências:

```bash
# Backend
cd backend
npm install

# Inicializar DB (seed padrão cria usuário admin)
npm run init-db

# Rodar em dev
npm run dev

# Agora o frontend
cd ../frontend
npm install --legacy-peer-deps # caso tenha problemas com as dependências, pode usar essa flag
npm run dev
```

Também é possível subir a aplicação com Docker através do alvo `make up` (é necessário ter Docker e docker-compose instalados):

```bash
make up

# caso nao tenha o make instalado, pode usar o docker-compose
docker-compose up -d --build

```

## Usuários seed

O projeto inclui um seed/init para facilitar testes:

- **Admin**
  - **Email:** admin@example.com
  - **Senha:** admin123

- **Usuário comum**
  - **Email:** user@example.com
  - **Senha:** user123

## Decisões técnicas

- Injeção de dependência: **tsyringe** injeção de dependências e testabilidade.
- Validação: **Zod** (esquemas e middleware de validação para `body`, `params`, `query`).
- Persistência: **SQLite** (leve e simples para desenvolvimento). Decisão de NÃO usar ORM inicialmente para manter o projeto leve e transparente; queries diretas + adapters via interfaces.
- Autenticação: **JWT** (senha com `bcryptjs`).
- Cliente HTTP: **axios** encapsulado em `infrastructure/httpClient` para chamadas ao GitHub, centralizando as chamadas e tratando erros.
- Testes: **Jest** com estrutura para unit tests;

Decisões adicionais e motivação técnica:

- Adotar **Zod** de forma sistemática para evitar erros por inputs mal formados: todos os contratos de entrada devem ter schemas em `backend/src/schemas` e serem aplicados via middleware (`validateBody`, `validateParams`, `validateQuery`). Isso reduz bugs por contrato inválido e facilita respostas de erro padronizadas.
- **Manter Clean Architecture** — separar responsabilidades entre `controllers`, `application` (casos de uso) e `models` (persistência). Comunicar entre camadas apenas por **interfaces**/contratos (ex.: `IUserModel`, `IHttpClient`) para evitar que camadas conheçam implementações concretas. Facilitando os testes.
- **Decisão sobre ORM:** optar por **não usar ORM** no início para manter o projeto leve e de fácil compreensão. Embora a introdução de um ORM (Prisma/TypeORM) possa trazer benefícios a médio prazo, a migração posterior exigirá trabalho adicional nas queries e na adaptação das interfaces — por isso a escolha de mantê-lo fora do escopo inicial.

**Frontend:**

- **State Management: Pinia** — escolhido para gerenciamento de estado reativo. Store centralizada para autenticação com computed properties (`isAuthenticated`, `isAdmin`) e persistência em localStorage para manter sessão entre reloads.

- **Validação de Formulários: VeeValidate + Zod** — validação declarativa e type-safe. Garantem consistência de validação.

- **Build Tool: Vite** — escolhido por desenvolvimento rápido e build otimizado. Configurado com path aliases (`@/`) para imports limpos e proxy para API durante desenvolvimento.

- **Interceptors Axios** — implementação de interceptors para adicionar token automaticamente em todas as requisições e tratamento centralizado de erros 401 (logout automático em falhas de autenticação).

- **Composition API** — uso consistente da Composition API do Vue 3 para melhor organização de lógica, reutilização e type-safety com TypeScript.


## Pontos de melhoria

1. Segurança e configuração
   - Mover fluxo de sessão no frontend para cookie `HttpOnly, Secure, SameSite` ou implementar refresh tokens.

2. Resiliência e performance
   - Implementar retry/exponential backoff para chamadas ao GitHub e respeitar `Retry-After`/rate-limit headers.
   - Cachear respostas externas (in-memory ou Redis) com TTL para reduzir chamadas repetidas.
   - Adicionar rate limiting em endpoints sensíveis (login, criação de recursos) com `express-rate-limit`.
   - Aplicar circuit breaker (ex.: `opossum`) para evitar falhas em cascata.

3. Observability e manutenção
   - Integrar logger estruturado (`pino` ou `winston`).
   - Expor métricas e traces (Prometheus + OpenTelemetry).
   - Substituir `throw new Error(...)` por classes de erro customizadas para mapeamento consistente no `errorHandler`.

4. Testes e CI
   - Adicionar testes de integração (rotas principais) e e2e (Cypress/Playwright).
   - Cobrir edge cases: responses parciais do GitHub, rate limit 429, falhas IO do DB, conflitos UNIQUE.
   - Pipeline CI (GitHub Actions) com lint, type-check, testes e coverage gating.

5. Banco de dados e migrações
   - Adicionar ferramenta de migrations (ex.: `knex`, `umzug`) se o projeto crescer.


## Checklist de requisitos

**Backend:**
- Node.js + Express + TypeScript
- SQLite como banco de dados
- JWT para autenticação
- Todos os endpoints implementados conforme especificação
- Middleware de autenticação e autorização
- Tratamento de erros

**Frontend:**
- Vue 3 + TypeScript
- Vue Router com guards por role
- Axios para chamadas HTTP
- Todas as telas implementadas (Login, Dashboard, Users, GitHub)
- Componentização básica