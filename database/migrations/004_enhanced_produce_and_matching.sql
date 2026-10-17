-- Migration 004: Enhanced Produce Listing, Buyer Requirements, Evidence & Quantity Verification

ALTER TABLE produce_listings
  ADD COLUMN IF NOT EXISTS total_available_quantity NUMERIC(14,3),
  ADD COLUMN IF NOT EXISTS remaining_quantity NUMERIC(14,3),
  ADD COLUMN IF NOT EXISTS sold_quantity NUMERIC(14,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reserved_quantity NUMERIC(14,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_buyer_quantity NUMERIC(14,3),
  ADD COLUMN IF NOT EXISTS number_of_bags INT,
  ADD COLUMN IF NOT EXISTS avg_bag_weight NUMERIC(14,3),
  ADD COLUMN IF NOT EXISTS measured_quantity NUMERIC(14,3),
  ADD COLUMN IF NOT EXISTS measurement_method VARCHAR(60),
  ADD COLUMN IF NOT EXISTS measurement_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS measurement_source VARCHAR(120),
  ADD COLUMN IF NOT EXISTS device_info JSONB,
  ADD COLUMN IF NOT EXISTS expected_price NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS min_acceptable_price NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS negotiation_preference VARCHAR(60),
  ADD COLUMN IF NOT EXISTS delivery_preference VARCHAR(120),
  ADD COLUMN IF NOT EXISTS listing_visibility VARCHAR(40) DEFAULT 'PUBLIC',
  ADD COLUMN IF NOT EXISTS quality_description TEXT,
  ADD COLUMN IF NOT EXISTS visible_condition VARCHAR(120),
  ADD COLUMN IF NOT EXISTS storage_info TEXT,
  ADD COLUMN IF NOT EXISTS location_approximate VARCHAR(255);

ALTER TABLE buyer_requirements
  ADD COLUMN IF NOT EXISTS required_quality VARCHAR(40),
  ADD COLUMN IF NOT EXISTS max_price NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(255),
  ADD COLUMN IF NOT EXISTS preferred_delivery_date DATE;

ALTER TABLE quality_images
  ADD COLUMN IF NOT EXISTS capture_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS upload_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS location_status VARCHAR(60),
  ADD COLUMN IF NOT EXISTS ai_assessment_id UUID;

CREATE TABLE IF NOT EXISTS quantity_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
  measured_quantity NUMERIC(14,3) NOT NULL,
  unit VARCHAR(40) NOT NULL,
  measurement_method VARCHAR(80) NOT NULL,
  measurement_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  measurement_source VARCHAR(120),
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quality_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
  evidence_type VARCHAR(60) NOT NULL, -- 'FARMER_PROVIDED', 'AI_VISUAL_ASSESSMENT', 'LABORATORY_TESTED', 'EXPERT_VERIFIED'
  file_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255),
  issue_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quantity_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
  declared_quantity NUMERIC(14,3) NOT NULL,
  pickup_quantity NUMERIC(14,3),
  delivered_quantity NUMERIC(14,3),
  difference NUMERIC(14,3),
  status VARCHAR(60) NOT NULL DEFAULT 'PENDING_REVIEW',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES produce_listings(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(80) NOT NULL,
  actor_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  evidence_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_remaining_qty ON produce_listings(remaining_quantity);
CREATE INDEX IF NOT EXISTS idx_evidence_events_listing ON evidence_events(listing_id, created_at DESC);
