CREATE TABLE IF NOT EXISTS negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  actor_user_id UUID NOT NULL REFERENCES users(id),
  action negotiation_action NOT NULL,
  price_per_unit NUMERIC(14,2),
  message TEXT,
  ai_suggested BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
