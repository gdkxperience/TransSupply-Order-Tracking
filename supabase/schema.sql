-- TransSupply Database Schema
-- Run this in Supabase SQL Editor (supabase.com -> Your Project -> SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  internal_ref TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pickup' CHECK (status IN ('pickup', 'warehouse', 'transit', 'delivered')),
  pickup_city TEXT,
  pickup_country TEXT,
  pickup_street TEXT,
  collection_date DATE,
  receiver_name TEXT,
  receiver_phone TEXT,
  receiver_city TEXT,
  receiver_country TEXT,
  total_weight_kg DECIMAL(10,2),
  total_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order boxes table
CREATE TABLE order_boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  client_ref TEXT,
  weight_kg DECIMAL(10,2),
  dimensions TEXT,
  packages INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order photos table
CREATE TABLE order_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table (frequent pickup locations)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  lat DECIMAL(10,6),
  lng DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients (admin sees all, client sees own)
CREATE POLICY "Admins can view all clients" ON clients
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can view own record" ON clients
  FOR SELECT USING (auth.uid()::text = id::text);

-- RLS Policies for orders
CREATE POLICY "Admins can do everything with orders" ON orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can view own orders" ON orders
  FOR SELECT USING (client_id::text = auth.uid()::text);

-- RLS Policies for order_boxes
CREATE POLICY "Admins can do everything with boxes" ON order_boxes
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can view boxes of own orders" ON order_boxes
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE client_id::text = auth.uid()::text)
  );

-- RLS Policies for order_photos
CREATE POLICY "Admins can do everything with photos" ON order_photos
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can view photos of own orders" ON order_photos
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE client_id::text = auth.uid()::text)
  );

-- RLS Policies for locations (everyone can view)
CREATE POLICY "Anyone can view locations" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage locations" ON locations
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders updated_at
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_boxes_order_id ON order_boxes(order_id);
CREATE INDEX idx_order_photos_order_id ON order_photos(order_id);
