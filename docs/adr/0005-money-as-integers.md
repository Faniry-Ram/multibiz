# 5. Money is stored as integer minor units, never float

## Status
Accepted

## Context
Floating point arithmetic is lossy for currency amounts (e.g. `0.1 + 0.2 !== 0.3`), and that risk
compounds across sync, aggregation, and CSV export. MultiBiz's default currency is the Ariary
(MGA), which in everyday use has no subdivision smaller than 1 Ar (unlike currencies with cents).

## Decision
All monetary amounts are stored as `bigint` in the database, representing the currency's minor
unit. A `Money` value object (`app/Support/Money.php`) wraps the integer amount together with a
currency code and knows each currency's minor-unit exponent (0 for MGA, 2 for a currency with
cents) so arithmetic, formatting, and comparisons always go through one place. Application code
never stores or compares raw floats for money.

## Consequences
- No floating-point rounding bugs in totals, dashboards, or CSV exports.
- Adding a currency with cents later (e.g. EUR) requires no schema change — only the `Money`
  object's per-currency exponent table changes.
- Every place that accepts a monetary amount from a form must convert it to the integer minor
  unit before it reaches an Action (e.g. "1 250 000 Ar" input stored as `1250000`).
