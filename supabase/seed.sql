-- Seed data for TransSupply
-- Run this after schema.sql in Supabase SQL Editor

-- Insert clients
INSERT INTO clients (id, email, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ops@aioc.az', 'AIOC'),
  ('22222222-2222-2222-2222-222222222222', 'logistics@bpsd.az', 'BPSD'),
  ('33333333-3333-3333-3333-333333333333', 'shipping@btc.az', 'BTC'),
  ('44444444-4444-4444-4444-444444444444', 'ops@bpcs.az', 'BPCS'),
  ('55555555-5555-5555-5555-555555555555', 'logistics@scpc.az', 'SCPC'),
  ('66666666-6666-6666-6666-666666666666', 'shipping@gpc.ge', 'GPC');

-- Insert locations
INSERT INTO locations (name, lat, lng) VALUES
  ('Vienna, Austria', 48.2082, 16.3738),
  ('Zurich, Switzerland', 47.3769, 8.5417),
  ('Norderstedt, Germany', 53.6859, 9.9867),
  ('Pavlov, Czech Republic', 48.8686, 16.6728),
  ('Arras, France', 50.2910, 2.7775),
  ('Campina, Romania', 45.0833, 25.7333),
  ('Oskarshamn, Sweden', 57.2656, 16.4500),
  ('Llanera, Spain', 43.4500, -5.9167),
  ('Cologne, Germany', 50.9375, 6.9603),
  ('Milan, Italy', 45.4642, 9.1900),
  ('Eibergen, Netherlands', 52.0983, 6.6500),
  ('Agotnes, Norway', 60.4000, 5.0333);

-- Insert sample orders with correct reference format (YYYY-MM-NNNN)
INSERT INTO orders (id, client_id, internal_ref, status, pickup_city, pickup_country, collection_date, receiver_name, receiver_phone, receiver_city, receiver_country, total_weight_kg, total_price) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '2025-04-0090', 'delivered', 'Eibergen', 'Netherlands', '2025-04-15', 'BPSD Logistics', '+994 12 345 6789', 'Baku', 'Azerbaijan', 120, 115),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '2025-04-0091', 'delivered', 'Vienna', 'Austria', '2025-04-16', 'AIOC Operations', '+994 12 345 6780', 'Baku', 'Azerbaijan', 36.6, 310),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '2025-04-0092', 'delivered', 'Norderstedt', 'Germany', '2025-04-18', 'AIOC Hamburg Branch', '+994 12 345 6781', 'Baku', 'Azerbaijan', 29, 185),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', '2026-01-0001', 'warehouse', 'Vienna', 'Austria', '2026-01-10', 'SCPC Baku Office', '+994 12 345 6790', 'Baku', 'Azerbaijan', 52.47, 310),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', '2026-01-0002', 'warehouse', 'Oskarshamn', 'Sweden', '2026-01-12', 'BTC Tbilisi HQ', '+995 32 123 4568', 'Tbilisi', 'Georgia', 1861, 850),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', '2026-01-0021', 'pickup', 'Arras', 'France', '2026-01-28', 'BPSD France Ops', '+994 12 345 6785', 'Baku', 'Azerbaijan', 5741.47, 650),
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '2026-01-0022', 'pickup', 'Zurich', 'Switzerland', '2026-01-29', 'AIOC Zurich', '+994 12 345 6786', 'Baku', 'Azerbaijan', 850, 320);

-- Insert order boxes
INSERT INTO order_boxes (order_id, client_ref, weight_kg, dimensions, packages) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'N3178987', 120, '120x85x69', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'N3180282', 9.94, '32x32x32', 2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'N3180297', 0.75, '32x32x12', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'N3180411', 10.04, '36x30x15', 3),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'N3180463', 2.6, '60x16x15', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'N3180526', 4.1, '30x30x24', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'N3180545', 10, '28x26x20', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'N3183169', 29, '60x40x58', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'N3255445', 1, '51x30x23', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'N3255460', 7.84, '36x30x25', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'N3255504', 0.4, '29x13x24', 1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'N3255131-1', 355, '120x80x65', 1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'N3255131-2', 357, '120x80x65', 1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'N3255131-3', 214, '120x80x65', 1),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'N3287785-1', 814.6, '120x80x100', 1),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'N3287785-2', 814.6, '120x80x100', 1),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'N3287785-3', 814.6, '120x80x100', 1),
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'N3287161', 850, '148x98x102', 1);
