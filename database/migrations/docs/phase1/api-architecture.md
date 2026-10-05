# REST API Architecture

Base path: `/api/v1`

## Auth
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/otp/request`
- POST `/auth/otp/verify`
- POST `/auth/refresh`
- POST `/auth/logout`

## Users
- GET `/users/me`
- PATCH `/users/me`
- PATCH `/users/me/language`

## Farmers/Farms
- GET `/farmers/me`
- PATCH `/farmers/me`
- GET `/farms`
- POST `/farms`
- PATCH `/farms/:id`

## Buyers
- GET `/buyers/me`
- PATCH `/buyers/me`
- GET `/buyer-requirements`
- POST `/buyer-requirements`
- PATCH `/buyer-requirements/:id`

## Crops/Produce
- GET `/crops`
- POST `/produce`
- GET `/produce`
- GET `/produce/:id`
- PATCH `/produce/:id`
- POST `/produce/:id/publish`
- POST `/produce/:id/images`

## Market/Pricing
- GET `/market-prices`
- POST `/ai/price-predictions`
- GET `/produce/:id/fair-price`
- POST `/produce/:id/price-floor`
- POST `/produce/:id/sell-vs-wait`
- POST `/produce/:id/best-markets`

## Quality
- POST `/produce/:id/quality-assessments`
- GET `/produce/:id/quality-assessments`
- POST `/orders/:id/delivery-quality`

## Matching/Offers/Negotiation
- GET `/produce/:id/buyer-matches`
- POST `/produce/:id/offers`
- GET `/produce/:id/offers`
- POST `/offers/:id/counter`
- POST `/offers/:id/accept`
- POST `/offers/:id/reject`
- GET `/negotiations/:id`

## Auctions
- POST `/auctions`
- GET `/auctions`
- GET `/auctions/:id`
- POST `/auctions/:id/bids`
- POST `/auctions/:id/close`

## Orders/Payments/Logistics
- POST `/orders`
- GET `/orders`
- GET `/orders/:id`
- POST `/orders/:id/payment`
- POST `/shipments`
- PATCH `/shipments/:id/status`

## Disputes/Trust
- POST `/orders/:id/disputes`
- GET `/disputes`
- GET `/trust/:userId`

## Collective Sales
- POST `/collective-sales`
- POST `/collective-sales/:id/join`
- POST `/collective-sales/:id/leave`

## Passport
- GET `/produce/:id/passport`
- GET `/passports/:lotId`

## Assistant
- POST `/ai/assistant/messages`
- GET `/ai/assistant/conversations/:id`

## Admin
- GET `/admin/analytics`
- GET `/admin/risk-flags`
- GET `/admin/audit-logs`

All protected endpoints require authentication and role/ownership checks as appropriate.
