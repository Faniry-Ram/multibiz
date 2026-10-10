# MultiBiz

MultiBiz is an app for managing several small businesses under one organization. Phase 1 (in
progress) covers finance only: businesses, categories, income/expense transactions, and a
dashboard. Later phases add catalog, stock, sales, orders, purchasing, analytics, and team
management — the architecture below is deliberately chosen to support those without rework.

A web app (Inertia + React, this repo) and a React Native mobile app with offline mode (future,
in `/mobile`) share one Laravel backend. The mobile app talks to a versioned push/pull sync API;
the web app never does.

## Monorepo layout

```
multibiz/
├── backend/            Laravel app (PHP, Inertia, React, Tailwind) — see below
├── mobile/             React Native app (not started yet)
├── packages/
│   └── shared-types/   TypeScript types generated from backend/app/Domain/*/Data DTOs
├── docs/adr/           Architecture Decision Records — read these for the "why"
└── docker-compose.yml  PostgreSQL + Redis for backend/ (see "Running the app")
```

Root-level `.gitignore` covers editor/AI-tool directories shared across the monorepo;
`backend/.gitignore` covers Laravel/Node build artifacts local to the backend.

## Architecture rules (non-negotiable — read the ADRs in `docs/adr/` for rationale)

1. **Domain-oriented structure.** Business logic lives under
   `backend/app/Domain/{Identity,Organization,Business,Finance,Sync}`, each with `Models/`,
   `Actions/`, `Data/`, `Policies/`, `Enums/`, `Queries/` as needed. Don't put business logic in
   controllers, models, or framework-level `app/Http` code.
2. **Thin controllers, shared Actions.** `app/Http/Web/Controllers` (Inertia) and
   `app/Http/Api/Controllers` (JSON, for the mobile sync API) both call the **same**
   `app/Domain/*/Actions` classes. A controller validates, calls one Action, returns a response —
   nothing else. See ADR 0001 and 0002.
3. **Money is integer minor units, never float.** Use `App\Support\Money`, backed by `bigint`
   columns. See ADR 0005.
4. **`occurred_at` vs `created_at`/`updated_at`.** `occurred_at` is the real-world date of a
   business event (user-provided, editable). `created_at`/`updated_at` are purely technical and
   never shown to users as "when this happened."
5. **Every business-owned table carries `organization_id` or `business_id`, plus a nullable
   `created_by`** (FK to `users`).
6. **Authorization is always through Policies**, scoped to the acting user's organization. A user
   must never be able to read or write another organization's data — this is a cross-cutting
   concern covered heavily in tests, not something checked ad hoc in controllers.

## Sync foundations (mobile offline support)

- Every synced model uses the `Syncable` trait (`app/Domain/Sync/Concerns`): UUID primary keys,
  `SoftDeletes`, and a `version` bigint column populated from the global Postgres sequence
  `sync_version_seq` on every save (see ADR 0003).
- `SyncRegistry` maps entity names (`"categories"`, `"transactions"`, ...) to model class, the
  fields a client may mutate, and the Action to call per operation type.
- `POST /api/sync/push` applies a batch of `{op_id, entity, entity_id, type, fields, client_ts}`
  operations, each in its own transaction, idempotent via `processed_operations`, with
  field-level last-write-wins (ADR 0004) — never full-row overwrite.
- `GET /api/sync/pull?since=<version>&limit=500` returns rows (including soft-deleted) with
  `version > since` for the user's businesses, plus `max_version` and `has_more`.

## Backend conventions

- PHP 8.3+, Laravel (latest stable), PostgreSQL, Redis.
- Auth: Sanctum — session guard for the web app, personal access tokens for the mobile API.
- DTOs: `spatie/laravel-data`, also used as the source for generated TypeScript types
  (`spatie/laravel-typescript-transformer`) in `backend/resources/js/types/generated` and
  `packages/shared-types`.
- UI language is French; default currency is Ariary (MGA), configurable per business. Format
  amounts like `1 250 000 Ar`.
- Inertia.js + React (TypeScript, strict) + Tailwind CSS, living in `backend/resources/js`, based
  on the official Laravel React starter kit. Two-factor auth and WebAuthn passkeys that shipped
  with the starter kit were intentionally removed for Phase 1 — login/register/logout only.

## Running the app

`docker-compose.yml` only runs the **data services** (Postgres, Redis) — PHP and Node run
directly on the host, not in a container:

```bash
cd backend
cp .env.example .env               # first time only
docker compose up -d               # Postgres + Redis
php artisan migrate --seed
composer run dev                   # serves the app + queue listener + Vite
```

The app is served at the URL in `APP_URL` (`http://localhost:8000` by default). `backend/.env`
points `DB_HOST`/`REDIS_HOST` at `127.0.0.1` using `FORWARD_DB_PORT` (`54320`) and
`FORWARD_REDIS_PORT` (`63790`) instead of Postgres/Redis's usual 5432/6379, because this machine
already runs unrelated containers on those default ports — check `backend/.env` before assuming
the defaults elsewhere.

`vendor/bin/pest` needs the `pgsql` container running too: the sync version sequence (ADR 0003)
is Postgres-only DDL, so tests run against a real Postgres database — a separate `testing`
database on the same container (auto-created by `docker/postgres/create-testing-database.sql` on
first boot; already-running containers got it created manually once, see git history). Tests
don't touch your seeded dev data: `testing` is a distinct database from `laravel`.

## Commands

All run from `backend/`:

| Purpose | Command |
|---|---|
| Run tests | `vendor/bin/pest` (or `php artisan test`) — needs `docker compose up -d` (Postgres) first |
| Static analysis | `vendor/bin/phpstan analyse --memory-limit=512M` (Larastan, level 7; default 128M limit is too low for this codebase) |
| Format PHP | `vendor/bin/pint` (check-only: `vendor/bin/pint --test`) |
| Frontend lint/format | `npm run check` (fix: `npm run check:fix`) |
| TypeScript type-check | `npm run types:check` |
| Generate TS types from PHP DTOs | `php artisan typescript:transform` |
| Generate Wayfinder route/controller helpers | `php artisan wayfinder:generate` (also runs automatically on `npm run build`/`dev`) |
| Everything CI runs | `composer ci:check` |

## Current status

Phases 2 and 3 are complete: monorepo/Docker/tooling, and the full data model — migrations,
models, the `Syncable` trait + sequence, factories, the `DemoDataSeeder`, Policies, and the
Business/Finance/Identity Actions, all covered by Pest tests (including cross-organization policy
denial). The actual sync API (`SyncRegistry`, `/api/sync/push`, `/api/sync/pull`) is Phase 5 and
**not implemented yet**.

Registering now also creates an `Organization` (required, since `users.organization_id` is
NOT NULL) — `App\Domain\Identity\Actions\RegisterOrganizationAndUser`, wired into Fortify's
`CreateNewUser`. This pulled a small piece of Phase 4's "register creates an organization" scope
forward into Phase 3, since the schema change made it unavoidable; the UI for it (an
"Organization name" field on `/register`) is bare-bones English for now — full French copy is
still Phase 4 work.

No web UI exists yet for businesses/categories/transactions/dashboard (Phase 4), and the
dashboard page is still the starter kit's placeholder.
