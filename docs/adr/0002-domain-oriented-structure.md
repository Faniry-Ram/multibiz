# 2. Domain-oriented structure instead of Laravel's default MVC folders

## Status
Accepted

## Context
Laravel's default `app/Models`, `app/Http/Controllers` structure scales poorly once an app covers
several distinct bounded contexts (here: identity, organizations, businesses, finance, and later
catalog, stock, sales, purchasing). Flat folders make it hard to see which code belongs to which
concept, and encourage putting business logic directly in controllers or models.

## Decision
Code is organized by domain under `app/Domain/{Identity,Organization,Business,Finance,Sync}`,
each with its own `Models/`, `Actions/`, `Data/`, `Policies/`, and `Enums/` as needed:

- **Models** — Eloquent models scoped to that domain.
- **Actions** — single-purpose classes that hold all business logic (`CreateBusiness`,
  `CreateTransaction`, ...). Controllers call Actions; Actions never render responses.
- **Data** — `spatie/laravel-data` DTOs used as Action input/output and for TypeScript generation.
- **Policies** — authorization rules, always scoped to the user's organization.
- **Queries** — read-only aggregation classes for reporting (e.g. `DashboardStats`), kept out of
  Actions since they don't mutate state.

Framework-level concerns (HTTP controllers, middleware, requests) stay under `app/Http`, split
into `Web` and `Api`, both calling into `app/Domain/*/Actions`.

## Consequences
- A new contributor can find "everything about Finance" in one folder.
- Controllers stay thin and interchangeable between the web and API surfaces (see ADR 0001).
- Slightly more ceremony than Laravel's default layout for trivial CRUD, which is an acceptable
  trade-off given the number of future phases (catalog, stock, sales, purchasing, team) planned
  for this app.
