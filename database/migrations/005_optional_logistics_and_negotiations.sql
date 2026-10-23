-- Migration 005: Optional Logistics Partner & Complete Negotiation History
-- This migration safely adds logistics preference columns to orders and ensures logistics_requests table exists.

-- 1. Add optional logistics columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS logistics_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS logistics_cost NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS logistics_payer VARCHAR(50) DEFAULT 'BUYER',
  ADD COLUMN IF NOT EXISTS logistics_status VARCHAR(50) DEFAULT 'NOT_REQUESTED',
  ADD COLUMN IF NOT EXISTS pickup_details TEXT,
  ADD COLUMN IF NOT EXISTS delivery_details TEXT;

-- 2. Create logistics_requests table if it does not already exist
CREATE TABLE IF NOT EXISTS logistics_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  logistics_partner_id UUID REFERENCES users(id),
  farmer_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  quantity NUMERIC(14,3) NOT NULL,
  unit VARCHAR(40) DEFAULT 'kg',
  distance_km NUMERIC(10,2) DEFAULT 25.0,
  vehicle_type VARCHAR(50) DEFAULT 'Medium Pickup (2.5T)',
  estimated_cost NUMERIC(12,2) DEFAULT 1200.00,
  status VARCHAR(50) DEFAULT 'REQUESTED',
  pickup_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_orders_logistics_status ON orders(logistics_status);
CREATE INDEX IF NOT EXISTS idx_logistics_requests_order_id ON logistics_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_requests_farmer_id ON logistics_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_logistics_requests_buyer_id ON logistics_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_offer_id ON negotiations(offer_id, created_at ASC);
