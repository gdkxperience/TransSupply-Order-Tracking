Order Management:

Input: Admin form: client select, pickup address (autocomplete), collection date, receiver details (name/phone/address), price, status.

Output: Auto-generate internal ref (YEAR + QUARTER + SEQ, e.g., 2026Q1-053). Add 1+ boxes (client ref, weight kg, dims LxWxH cm, packages #).

Rules: Internal ref unique per quarter. Client sees only their boxes. Status changes trigger email? (TBD).

Errors: Duplicate client ref → warning. Invalid dims → validation (positive numbers).

Client Management:

Input: Admin: client name/email/password.

Output: Login creates tenant scope.

Rules: RLS enforces client_id filter.

Errors: Email exists → prevent duplicate.

Order View/List:

Input: Client login → filter by status/date/location.

Output: Table: ref nums, receiver, pickup→Schwanendael, weight total, status badge.

Rules: Aggregate box totals per order.

Errors: No orders → empty state.

Map/Photos/Export:

Input: Order ID click.

Output: Google Maps embed (pickup → fixed warehouse). Photo gallery. PDF gen (list/details).

Rules: Distance calc auto. Photos <5MB each.

Errors: Geocode fail → manual coords.

