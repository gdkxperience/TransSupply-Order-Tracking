Entities & Relations (PostgreSQL):

clients (1:many orders)

Field	Type	Notes
id	uuid PK	Supabase auto
email	varchar UNIQUE	Login
name	varchar	Company name
created_at	timestamp	
orders (1:many order_boxes; pickup→Schwanendael fixed delivery)

Field	Type	Notes
id	uuid PK	
client_id	uuid FK	RLS filter
internal_ref	varchar UNIQUE	2026Q1-053 (computed/trigger)
status	enum('pickup', 'warehouse', 'delivered')	
pickup_address	jsonb	{street, city, country}
collection_date	date	
receiver_name	varchar	
receiver_phone	varchar	
receiver_address	jsonb	Fixed? Schwanendael
total_weight_kg	decimal	Sum boxes
total_price	decimal	
photos	text[]	S3 URLs
order_boxes (many:1 orders)

Field	Type	Notes
id	uuid PK	
order_id	uuid FK	
client_ref	varchar	Client's number
weight_kg	decimal	
dimensions	varchar	"120x80x50 cm"
packages	int	# boxes
locations (frequent pickups)

Field	Type	Notes
id	uuid PK	
name	varchar	"Vienna, AT"
coords	point	lat/lng
Sample Record:

text
orders: {id: uuid, client_id: uuid, internal_ref: "2026Q1-053", status: "warehouse", pickup_address: {"city": "Vienna", "country": "Austria"}, total_weight_kg: 250.5, ...}
order_boxes: [{order_id: ..., client_ref: "CLI-123", weight_kg: 120, dimensions: "100x50x40"}]
Indexing: client_id+status (queries), internal_ref (unique), collection_date (ranges).