# 3. A single global Postgres sequence drives every synced row's version

## Status
Accepted

## Context
The mobile app will sync offline changes via `pull?since=<version>`. For that cursor to be
reliable, "version" must be a strictly increasing number that pull requests can compare against,
and it must stay consistent across every syncable table — a client pulling changes for
businesses, categories, and transactions needs one cursor, not three.

Using each row's own auto-increment id doesn't work (ids aren't ordered by mutation time across
tables), and per-table `updated_at` timestamps aren't strictly monotonic or collision-free under
concurrent writes.

## Decision
A single PostgreSQL sequence, `sync_version_seq`, is shared by every `Syncable` model. On every
insert or update, a model event pulls `nextval('sync_version_seq')` and stores it in that row's
`version` column. Each syncable table has an index on `(business_id, version)`.

## Consequences
- `version` is comparable across tables: "give me everything after version N" is a single
  well-ordered cursor regardless of which tables changed.
- Every write pays the (cheap) cost of one sequence increment, even outside of sync-originated
  writes — simpler than trying to special-case which writes need a version bump.
- The sequence is global, so gaps are expected and harmless (e.g. a rejected sync op still may
  have consumed a version number upstream elsewhere); gaps never break `since=` pagination.
