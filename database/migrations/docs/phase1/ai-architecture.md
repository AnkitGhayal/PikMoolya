# AI/ML Architecture

## Service

Use Python + FastAPI for AI/ML services.

```text
Backend
  |
  +--> Price Prediction
  +--> Quality Analysis
  +--> Buyer Matching
  +--> Demand Forecast
  +--> Sell-vs-Wait
  +--> Market Optimization
```

## Price prediction

Baseline: XGBoost regression.

Features:
- crop
- variety
- market
- district/state
- date/season
- historical min/max/modal price
- demand
- supply
- weather
- quality
- quantity
- transport distance

Outputs:
- predicted price
- lower bound
- upper bound
- uncertainty/confidence indicator

Actual market price and model prediction must always be distinguishable.

Initial data:
- synthetic/demo mandi history
- UI must say "Demo/Synthetic Data"
- architecture must allow future Agmarknet/eNAM replacement

## Fair-price explanation

The model result is passed through a deterministic explanation layer:
- demand contribution
- quality contribution
- trend contribution
- transport contribution
- local-condition contribution

The explanation must never invent numerical inputs.

## Price floor

```text
floor =
production_cost
+ transport_cost
+ storage_cost
+ packaging_cost
+ other_costs
+ expected_spoilage_cost
+ desired_minimum_return
```

The exact unit basis must be consistent (for example ₹/quintal).

## Sell-now-vs-wait

Return pessimistic, expected and optimistic scenarios.
Include storage, spoilage, probability/risk and expected net.
Confidence must be based on model evaluation history, not a hard-coded arbitrary value.

## Best market

For each market:

```text
effective_net =
market_price
- transport_cost
- applicable_fees
- other_known_costs
```

Rank by effective net, not sticker price.

## Buyer matching

Example weighted score:
- price
- distance
- crop/quality/quantity match
- payment reliability
- cancellation history

Weights must be configurable and auditable.

## Effective-net offer

```text
effective_net_offer =
offer_value
- transport_cost
- platform_fees
- estimated_risk_cost
```

Never automatically choose the winner for the farmer.

## Quality

Input:
- top
- side
- close-up
- random sample
- optional video

Output:
- size
- color
- damage
- defects
- uniformity
- rot
- appearance
- score
- grade
- confidence

Label: "AI-assisted quality assessment".

## LLM assistant

LLM receives structured backend facts/tools and narrates them.
It must never generate or guess a price independently.

## Explainability

Every AI result answers:
1. What?
2. Why?
3. How confident?

Safety:
- no guaranteed profits/prices
- no fabricated confidence
- no unsupported fraud accusations
- no hidden costs
- no manipulation
