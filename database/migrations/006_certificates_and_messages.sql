-- Migration 006: Certificates and Messages tables
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id VARCHAR(255) UNIQUE NOT NULL,
  product_id VARCHAR(255),
  farmer_id VARCHAR(255) NOT NULL,
  farmer_name VARCHAR(255),
  crop_name VARCHAR(255) NOT NULL,
  variety VARCHAR(255),
  quantity FLOAT,
  unit VARCHAR(50),
  location VARCHAR(255),
  quality_score FLOAT NOT NULL,
  quality_grade VARCHAR(10) NOT NULL,
  confidence FLOAT DEFAULT 91.0,
  estimated_price FLOAT,
  price_range VARCHAR(255),
  assessment_data JSONB,
  assessment_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR(255) NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id),
  sender_role VARCHAR(50),
  receiver_id UUID REFERENCES users(id),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES produce_listings(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_farmer_id ON certificates(farmer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_offer_id ON messages(offer_id);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);
