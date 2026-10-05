-- PikMoolya: upgrade market_prices for real AGMARKNET data.
-- Safe to run while the NestJS server is running.
ALTER TABLE market_prices
  ADD COLUMN IF NOT EXISTS variety varchar(255),
  ADD COLUMN IF NOT EXISTS grade varchar(255),
  ADD COLUMN IF NOT EXISTS data_source varchar(80) NOT NULL DEFAULT 'DEMO',
  ADD COLUMN IF NOT EXISTS source_record_id varchar(255);

CREATE INDEX IF NOT EXISTS idx_market_prices_crop_date
  ON market_prices (crop_id, price_date);

CREATE INDEX IF NOT EXISTS idx_market_prices_source_record
  ON market_prices (source_record_id);

-- Existing demo rows remain marked DEMO.
-- The importer will write real rows with data_source = AGMARKNET.
