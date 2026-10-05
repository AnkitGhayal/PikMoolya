# Mobile Architecture

Technology: React Native + Expo + TypeScript.

## Screens

### Before login
- language selector

### Farmer
- Login/Register
- Dashboard
- My Produce
- Add Produce
- Camera/Photo Upload
- Quality Result
- Fair Price Certificate
- Why This Price?
- Price Floor
- Sell Now vs Wait
- Best Market
- Find Buyers
- Selling Round
- Offers
- Negotiation Ledger
- Orders
- Shipment Tracking
- Delivery Quality
- Payments
- Produce Passport / QR
- Collective Sale
- Notifications
- Ask PikMoolya AI
- Settings

### Buyer
- Dashboard
- Search Produce
- Produce Details
- AI Quality
- Requirements
- Offers
- Auctions
- Orders
- Delivery Verification
- Disputes
- Profile

## Offline-first

Cache:
- saved prices
- draft listings
- local photos
- incomplete forms

Show ONLINE/OFFLINE status.
Never display a cached AI prediction as fresh/live.

## Localization

Use:
- `en.json`
- `hi.json`
- `mr.json`

Components use translation keys, not hard-coded language text.

## UX

- large touch targets
- simple language
- low-bandwidth friendly
- minimal jargon
- accessible colors/contrast
- voice input/output
