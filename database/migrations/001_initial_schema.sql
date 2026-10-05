-- PikMoolya Phase 1 initial PostgreSQL schema
-- Design only. Phase 2 will create and run migrations through the backend workflow.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('FARMER','BUYER','ADMIN','LOGISTICS_PARTNER');
CREATE TYPE user_status AS ENUM ('PENDING','ACTIVE','SUSPENDED','BLOCKED');
CREATE TYPE listing_status AS ENUM ('DRAFT','PUBLISHED','IN_SELLING_ROUND','SOLD','CANCELLED','EXPIRED');
CREATE TYPE quality_grade AS ENUM ('A','B','C','UNASSESSED');
CREATE TYPE assessment_stage AS ENUM ('LISTING','PURCHASE','PICKUP','DELIVERY');
CREATE TYPE offer_status AS ENUM ('PENDING','COUNTERED','ACCEPTED','REJECTED','EXPIRED','CANCELLED');
CREATE TYPE auction_status AS ENUM ('DRAFT','ACTIVE','CLOSED','CANCELLED');
CREATE TYPE order_status AS ENUM ('PENDING','CONFIRMED','PICKUP_SCHEDULED','IN_TRANSIT','DELIVERED','COMPLETED','CANCELLED','DISPUTED');
CREATE TYPE payment_status AS ENUM ('PENDING','AUTHORIZED','RELEASED','FAILED','REFUNDED');
CREATE TYPE shipment_status AS ENUM ('CREATED','ASSIGNED','PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED');
CREATE TYPE dispute_status AS ENUM ('OPEN','UNDER_REVIEW','RESOLVED','REJECTED');
CREATE TYPE membership_status AS ENUM ('INVITED','OPTED_IN','LEFT','REMOVED');
CREATE TYPE notification_status AS ENUM ('UNREAD','READ');
CREATE TYPE prediction_data_status AS ENUM ('DEMO_SYNTHETIC','LIVE');
CREATE TYPE negotiation_action AS ENUM ('OFFER','COUNTER','ACCEPT','REJECT','NOTE');
CREATE TYPE risk_flag_type AS ENUM ('LOW_OFFER','ANOMALY','QUALITY_CHANGE','CANCELLATION_RISK','OTHER');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash TEXT,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'PENDING',
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    phone_verified_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    address TEXT,
    district VARCHAR(120),
    state VARCHAR(120),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    buyer_type VARCHAR(100),
    address TEXT,
    district VARCHAR(120),
    state VARCHAR(120),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    payment_reliability_score NUMERIC(5,2),
    cancellation_rate NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    name VARCHAR(200),
    address TEXT,
    district VARCHAR(120),
    state VARCHAR(120),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    area_acres NUMERIC(12,3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    variety VARCHAR(120),
    unit VARCHAR(40) NOT NULL DEFAULT 'quintal',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(name, variety)
);

CREATE TABLE produce_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    farm_id UUID REFERENCES farms(id),
    crop_id UUID NOT NULL REFERENCES crops(id),
    quantity NUMERIC(14,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(40) NOT NULL DEFAULT 'quintal',
    harvest_date DATE,
    location_name VARCHAR(255),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    production_cost_per_unit NUMERIC(14,2),
    transport_cost_per_unit NUMERIC(14,2),
    storage_cost_per_unit NUMERIC(14,2),
    packaging_cost_per_unit NUMERIC(14,2),
    other_cost_per_unit NUMERIC(14,2),
    desired_min_return_per_unit NUMERIC(14,2),
    status listing_status NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quality_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
    image_type VARCHAR(40) NOT NULL,
    storage_url TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quality_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
    stage assessment_stage NOT NULL,
    score NUMERIC(5,2),
    grade quality_grade NOT NULL DEFAULT 'UNASSESSED',
    confidence NUMERIC(5,2),
    size_score NUMERIC(5,2),
    color_score NUMERIC(5,2),
    damage_score NUMERIC(5,2),
    defect_score NUMERIC(5,2),
    uniformity_score NUMERIC(5,2),
    rot_score NUMERIC(5,2),
    appearance_score NUMERIC(5,2),
    model_name VARCHAR(200),
    model_version VARCHAR(100),
    notes TEXT,
    is_ai_assisted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES crops(id),
    market_name VARCHAR(255) NOT NULL,
    district VARCHAR(120),
    state VARCHAR(120),
    price_date DATE NOT NULL,
    min_price NUMERIC(14,2),
    max_price NUMERIC(14,2),
    modal_price NUMERIC(14,2),
    source VARCHAR(120) NOT NULL,
    data_status prediction_data_status NOT NULL DEFAULT 'DEMO_SYNTHETIC',
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
    predicted_price_per_unit NUMERIC(14,2) NOT NULL,
    lower_bound_per_unit NUMERIC(14,2),
    upper_bound_per_unit NUMERIC(14,2),
    confidence NUMERIC(5,2),
    uncertainty NUMERIC(14,4),
    model_name VARCHAR(200) NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    input_features JSONB NOT NULL DEFAULT '{}',
    data_status prediction_data_status NOT NULL DEFAULT 'DEMO_SYNTHETIC',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL UNIQUE REFERENCES price_predictions(id) ON DELETE CASCADE,
    explanation JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE buyer_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES crops(id),
    min_quantity NUMERIC(14,3),
    max_quantity NUMERIC(14,3),
    minimum_grade quality_grade,
    target_price_per_unit NUMERIC(14,2),
    max_distance_km NUMERIC(12,2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE buyer_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2),
    price_score NUMERIC(5,2),
    distance_score NUMERIC(5,2),
    crop_quality_quantity_score NUMERIC(5,2),
    payment_reliability_score NUMERIC(5,2),
    cancellation_score NUMERIC(5,2),
    explanation JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(listing_id, buyer_id)
);

CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES produce_listings(id),
    created_by UUID NOT NULL REFERENCES users(id),
    status auction_status NOT NULL DEFAULT 'DRAFT',
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    minimum_bid_per_unit NUMERIC(14,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auction_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    bid_per_unit NUMERIC(14,2) NOT NULL,
    transport_cost_per_unit NUMERIC(14,2),
    estimated_risk_cost_per_unit NUMERIC(14,2),
    effective_net_per_unit NUMERIC(14,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES produce_listings(id),
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    auction_id UUID REFERENCES auctions(id),
    offered_price_per_unit NUMERIC(14,2) NOT NULL,
    transport_cost_per_unit NUMERIC(14,2),
    platform_fee_per_unit NUMERIC(14,2),
    estimated_risk_cost_per_unit NUMERIC(14,2),
    effective_net_per_unit NUMERIC(14,2),
    status offer_status NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE negotiations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    actor_user_id UUID NOT NULL REFERENCES users(id),
    action negotiation_action NOT NULL,
    price_per_unit NUMERIC(14,2),
    message TEXT,
    ai_suggested BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES produce_listings(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    accepted_offer_id UUID REFERENCES offers(id),
    quantity NUMERIC(14,3) NOT NULL,
    agreed_price_per_unit NUMERIC(14,2) NOT NULL,
    expected_gross NUMERIC(16,2),
    expected_net NUMERIC(16,2),
    status order_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(16,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'PENDING',
    provider VARCHAR(80),
    provider_reference VARCHAR(255),
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    logistics_partner_id UUID REFERENCES users(id),
    transport_cost NUMERIC(16,2),
    status shipment_status NOT NULL DEFAULT 'CREATED',
    pickup_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    tracking_reference VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE delivery_quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES quality_assessments(id),
    comparison JSONB NOT NULL DEFAULT '{}',
    quality_change_detected BOOLEAN NOT NULL DEFAULT FALSE,
    evidence_urls JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    opened_by UUID NOT NULL REFERENCES users(id),
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    evidence JSONB NOT NULL DEFAULT '[]',
    status dispute_status NOT NULL DEFAULT 'OPEN',
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    delivery_success_score NUMERIC(5,2),
    quality_consistency_score NUMERIC(5,2),
    cancellation_score NUMERIC(5,2),
    dispute_score NUMERIC(5,2),
    payment_success_score NUMERIC(5,2),
    delay_score NUMERIC(5,2),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collective_sale_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES crops(id),
    target_buyer_id UUID REFERENCES buyers(id),
    status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
    target_quantity NUMERIC(14,3),
    combined_quantity NUMERIC(14,3) DEFAULT 0,
    suggested_reason JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collective_sale_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES collective_sale_groups(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    listing_id UUID NOT NULL REFERENCES produce_listings(id),
    status membership_status NOT NULL DEFAULT 'INVITED',
    opted_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(group_id, listing_id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(80),
    status notification_status NOT NULL DEFAULT 'UNREAD',
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ
);

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    structured_context JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE produce_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL UNIQUE REFERENCES produce_listings(id) ON DELETE CASCADE,
    lot_id VARCHAR(100) NOT NULL UNIQUE,
    qr_payload TEXT NOT NULL,
    passport_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id),
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    before_data JSONB,
    after_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES produce_listings(id),
    offer_id UUID REFERENCES offers(id),
    order_id UUID REFERENCES orders(id),
    raised_by UUID REFERENCES users(id),
    flag_type risk_flag_type NOT NULL,
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    reason TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_farms_farmer ON farms(farmer_id);
CREATE INDEX idx_listings_farmer_status ON produce_listings(farmer_id, status);
CREATE INDEX idx_listings_crop_status ON produce_listings(crop_id, status);
CREATE INDEX idx_quality_listing_stage ON quality_assessments(listing_id, stage);
CREATE INDEX idx_market_prices_crop_date ON market_prices(crop_id, price_date);
CREATE INDEX idx_market_prices_market_date ON market_prices(market_name, price_date);
CREATE INDEX idx_predictions_listing ON price_predictions(listing_id, generated_at DESC);
CREATE INDEX idx_matches_listing ON buyer_matches(listing_id, match_score DESC);
CREATE INDEX idx_offers_listing_status ON offers(listing_id, status);
CREATE INDEX idx_auctions_status_end ON auctions(status, ends_at);
CREATE INDEX idx_bids_auction ON auction_bids(auction_id, effective_net_per_unit DESC);
CREATE INDEX idx_orders_farmer_status ON orders(farmer_id, status);
CREATE INDEX idx_orders_buyer_status ON orders(buyer_id, status);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_risk_flags_status ON risk_flags(status);

-- Phase 2 should add database-level updated_at triggers and stricter domain checks
-- as part of the migration implementation.
