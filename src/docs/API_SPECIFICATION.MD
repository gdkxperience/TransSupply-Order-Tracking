Auth: JWT from Supabase (RLS auto-filters).

Endpoints:

text
POST /rpc/create_order → {client_id, pickup_address, ...} → returns order w/ internal_ref
GET /orders?client_id=eq.{id}&status=eq.warehouse → paginated list
GET /orders/{id}?select=*,order_boxes(*) → details + boxes
POST /orders/{id}/photos → upload URL
GET /rpc/export_pdf?id={order_id} → PDF blob
Payload Example (Create Order):

json
{
  "pickup_address": {"city": "Rome", "country": "Italy"},
  "collection_date": "2026-02-01",
  "receiver_name": "John Doe",
  "order_boxes": [{"client_ref": "IT-456", "weight_kg": 100, "dimensions": "L120xW80xH60"}]
}
Errors: 400 JSON {error: "Invalid dims"}.
​