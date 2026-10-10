# 4. Field-level last-write-wins for sync conflict resolution

## Status
Accepted

## Context
The mobile app works offline. Two devices (or a device and the web app) can edit the same record
while disconnected from each other. When both sets of changes eventually reach `POST
/api/sync/push`, the server needs a deterministic, simple rule for what "wins."

Row-level last-write-wins (overwrite the whole record with whichever write arrives last) silently
discards unrelated edits — e.g. device A changes a transaction's `note` while device B changes its
`amount`; row-level LWW would make one of those edits vanish even though they don't conflict.

## Decision
Sync push operations only ever send the fields that actually changed (`fields: {amount: 5000}`,
not a full record). Applying an `update` operation only touches the fields present in that
payload, so two non-overlapping edits to the same row both survive. When two operations do touch
the same field, whichever is applied last (by processing order of the push batch, server time)
wins for that field — there is no merge logic beyond "last write to this field wins."

## Consequences
- Non-conflicting concurrent edits to different fields of the same row never clobber each other.
- True conflicts (same field, two offline edits) silently pick a winner with no user-facing merge
  UI — acceptable for Phase 1's finance data, revisit if future domains need real conflict
  resolution (e.g. stock quantities).
- Clients must diff their local state and send only changed fields, not full snapshots.
