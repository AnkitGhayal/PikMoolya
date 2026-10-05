# PikMoolya Maharashtra Real Market Integration

## What this adds

1. Maharashtra market-price synchronization from the Government of India's data.gov.in AGMARKNET resource.
2. Dynamic Crop + Variety creation from the actual Maharashtra market records returned by AGMARKNET.
3. `GET /market-prices` for Maharashtra real market observations.
4. `POST /market-prices/sync-maharashtra` to import/update the data.
5. Market records retain source, variety, grade and source record id.
6. The mobile app can continue using the existing `/market-optimizer/best-market` endpoint once its market-price table contains real rows.

The official OGD resource is:
https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi

The API resource id used by this integration is:
9ef84268-d588-465a-a308-a864a43d0070

## Install

No extra backend npm package is required; Node 24 provides `fetch`.

## Database

Run `database/market_prices_agmarknet_upgrade.sql` against `pikmoolya`.

## Environment

Add this to `apps/api/.env`:

DATA_GOV_API_KEY=YOUR_DATA_GOV_IN_API_KEY

Do not commit the real API key.

## Backend files

Replace/add:

src/market-prices/entities/market-price.entity.ts
src/market-prices/dto/market-price-query.dto.ts
src/market-prices/market-prices.service.ts
src/market-prices/market-prices.controller.ts
src/market-prices/market-prices.module.ts

Your existing AppModule must import MarketPricesModule. If it already does, no change is required.

## Sync

After the API key is configured and the database columns exist:

POST /market-prices/sync-maharashtra

The endpoint requires a valid JWT with the current app guard.

The importer paginates through Maharashtra records, creates missing crop/variety rows, and upserts daily market prices.

## Important

AGMARKNET is daily market data, not a guaranteed live quote. PikMoolya should display the arrival/price date and source. The latest available record can be delayed.
