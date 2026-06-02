# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev       # watch mode
npm run build           # compile

# Testing
npm run test            # unit tests (jest, rootDir: src, pattern: *.spec.ts)
npm run test:watch      # watch mode
npm run test:cov        # with coverage
npm run test:e2e        # e2e tests (./test/jest-e2e.json)

# Run a single test file
npx jest src/modules/<feature>/<feature>.service.spec.ts

# Linting / formatting
npm run lint            # eslint --fix
npm run format          # prettier --write

# Prisma
npx prisma migrate dev --name <name>   # create and apply migration
npx prisma generate                    # regenerate client
```

## Architecture

NestJS 11 + Prisma 5 + Passport JWT + bcrypt. Backend-only — no `client/` directory.

### Strict layer flow

```
Controller → Service → Repository → PrismaService
```

Never skip layers. Prisma queries live **only** in `*.repository.ts` files — one repository per table.

### Module structure (`src/modules/<feature>/`)

```
<feature>.module.ts
<feature>.controller.ts
<feature>.service.ts
<feature>.repository.ts
dto/
  create-<feature>.dto.ts   ← Zod schema + createZodDto
  update-<feature>.dto.ts
```

### DTOs

- **Input DTOs**: Zod schema with `createZodDto`. If the table has `activo`, include `activo: z.boolean().default(true)` in the create DTO.
- **Response DTOs**: plain class with `@ApiProperty` decorators.

### HTTP decorators

Always import HTTP method decorators from `@common/decorators/http-endpoints.decorator`, **never** from `@nestjs/common`.

### Soft delete

Use `toggleActivo` in the repository via `$executeRaw`. **Never** call `prisma.X.delete()`.

Every CRUD module must expose `GET /select` returning `DropdownItemDto[]` from `src/common/`.

### Transactions

All multi-table writes must be wrapped in `prisma.$transaction`.

### Code style

- Zero `any` / `unknown` without a justification comment on the adjacent line.
- Zero comments except to justify `any`/`unknown` or special cases.
- User-facing messages (exceptions, Zod errors) always in **Spanish**.
- Single quotes, trailing commas (see `.prettierrc`).

### Common utilities (`src/common/`)

Check here before writing new code — `PaginationDto`, `DropdownItemDto`, `paginate()`, HTTP decorators, and Zod pipes may already exist.

### Tests (`src/common/mocks/`)

- Mock data in `src/common/mocks/<entity>.mock.ts`, typed against `src/common/interfaces/<entity>.interface.ts`.
- Mock Prisma via `createMockPrismaService` from `src/common/mocks/prisma.mock.ts`.
- Spec files colocated with the file under test (`<feature>.service.spec.ts`).
- No `as any` in specs — import and use the real DTOs/interfaces.
- Test names in Spanish: `debe...`.

## Agents & Commands

| Agent / Command | When to use |
|---|---|
| `issue-planner` | Start of any new issue — produces plan + API contract before coding |
| `nestjs-dev` | Any change in `src/modules/` (controllers, services, repositories, DTOs, migrations) |
| `test-unitario` | Generate/complete unit specs after `nestjs-dev` finishes |
| `code-reviewer` | After any significant change in `src/`, before committing |
| `/fix-issue` | Full flow: plan → implement → test → review |
| `/commit` | Stage and commit following team conventions (Spanish imperative message, English branch name) |

The `code-reviewer` agent is **read-only** and uses Opus. It requires `.claude/rules/academico-architecture.md` and `.claude/rules/academico-testing-standard.md` — create these rule files to unlock full review capability.
