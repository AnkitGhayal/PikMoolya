# System Architecture

## Product goal

PikMoolya is an AI Smart Selling Decision Platform. It helps a farmer decide:

**WHEN + WHERE + TO WHOM + AT WHAT PRICE** to sell.

## High-level architecture

```text
Farmer Mobile App / Buyer Web+Mobile / Admin Web
                    |
                    v
              API / Backend
                    |
       +------------+-------------+
       |            |             |
       v            v             v
 PostgreSQL       Redis       Object Storage
       |                          |
       +------------+-------------+
                    |
                    v
              AI/ML Service
                    |
       +------------+-------------+
       |            |             |
       v            v             v
 Price Model   Quality CV   Decision Engines
```

## Main backend domains

1. Authentication and users
2. Farmer profiles and farms
3. Buyer profiles and requirements
4. Crops and produce listings
5. Market prices
6. Fair price / price floor
7. Sell-now-vs-wait
8. Market optimization
9. Buyer matching
10. Offers and negotiation
11. Auctions
12. Orders and payments
13. Logistics and delivery quality
14. Disputes
15. Trust scores
16. Collective sales
17. Produce passport
18. Notifications
19. AI assistant
20. Admin and audit

## Decision flow

```text
Produce
 -> Quality Assessment
 -> Fair Price
 -> Price Floor
 -> Market Comparison
 -> Sell Now vs Wait
 -> Buyer Matching
 -> Buyer Competition
 -> Risk Analysis
 -> Best Effective-Net Deal
 -> Negotiation
 -> Order
 -> Pickup
 -> Delivery Quality
 -> Payment
 -> Produce Passport
```

Every AI recommendation must say: "AI recommendation, not a guaranteed outcome."
