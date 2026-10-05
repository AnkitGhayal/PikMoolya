# ER Diagram — Text

```text
USERS
  |-- FARMERS --< FARMS
  |             |
  |             +--< PRODUCE_LISTINGS >-- CROPS
  |
  +-- BUYERS --< BUYER_REQUIREMENTS
  |
  +--< NOTIFICATIONS
  +--< AI_CONVERSATIONS
  +--< AUDIT_LOGS

PRODUCE_LISTINGS
  |--< QUALITY_IMAGES
  |--< QUALITY_ASSESSMENTS
  |--< PRICE_PREDICTIONS
  |--< PRICE_EXPLANATIONS
  |--< BUYER_MATCHES >-- BUYERS
  |--< OFFERS >-- BUYERS
  |--< AUCTIONS --< AUCTION_BIDS >-- BUYERS
  |--< NEGOTIATIONS
  |--< ORDERS
  |--< COLLECTIVE_SALE_MEMBERS >-- COLLECTIVE_SALE_GROUPS
  +-- PRODUCE_PASSPORTS

ORDERS
  |--< PAYMENTS
  |--< SHIPMENTS
  |--< DELIVERY_QUALITY_CHECKS
  +--< DISPUTES

USERS
  +--< TRUST_SCORES
```

Cardinality conventions:
- `1 -> many` is represented by `--<`.
- Foreign keys enforce relationships.
- Important business events retain timestamps and audit records.
