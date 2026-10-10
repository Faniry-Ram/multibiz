# 1. Inertia monolith for the web app, separate stateless API for sync

## Status
Accepted

## Context
MultiBiz needs a web app (desktop-first, SaaS-style UI) and, in a later phase, a React Native
mobile app that must work offline and sync in the background. These two clients have very
different needs: the web app benefits from server-driven rendering and session auth (Inertia +
Sanctum sessions), while the mobile app needs a versioned, stateless, token-authenticated API it
can call opportunistically when connectivity returns.

## Decision
- The web app is a classic Laravel + Inertia.js + React monolith. Controllers under
  `app/Http/Web` return Inertia responses and authenticate via Sanctum's session guard.
- A separate JSON API under `app/Http/Api` (routes in `routes/api.php`) serves the mobile app:
  token auth via Sanctum personal access tokens, and the sync push/pull endpoints.
- Both control layers call the **same** Actions in `app/Domain/*/Actions`. Controllers are thin;
  no business logic is duplicated between the web and API surfaces.

## Consequences
- One Laravel codebase, one deployment, one source of truth for business rules.
- The mobile app never talks to Inertia; it only ever talks to `routes/api.php`.
- Adding a new business rule means touching one Action, exercised by two thin controllers.
