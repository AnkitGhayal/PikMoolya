-- Migration 007: Align price_predictions columns for both listing and crop prediction queries
ALTER TABLE price_predictions
    ADD COLUMN IF NOT EXISTS crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS market_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS prediction_date DATE DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS predicted_price NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS lower_bound NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS upper_bound NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

UPDATE price_predictions
SET predicted_price = predicted_price_per_unit
WHERE predicted_price IS NULL AND predicted_price_per_unit IS NOT NULL;

UPDATE price_predictions
SET lower_bound = lower_bound_per_unit
WHERE lower_bound IS NULL AND lower_bound_per_unit IS NOT NULL;

UPDATE price_predictions
SET upper_bound = upper_bound_per_unit
WHERE upper_bound IS NULL AND upper_bound_per_unit IS NOT NULL;
