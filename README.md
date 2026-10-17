# PikMoolya — AI-Based Fair Price Discovery and Direct Market Access Platform for Farmers

PikMoolya is an agricultural commerce platform that empowers farmers with AI-driven fair price discovery, computer vision crop quality assessment, and direct marketplace access.

---

## 1. Project Overview & Research Paper Model

PikMoolya addresses price information asymmetry between smallholder farmers and institutional buyers. The platform provides transparent pricing based on the conceptual pricing function:

$$P_f = f(C, L, Q, M, H)$$

Where:
- **C** = Crop characteristics and variety
- **L** = Geographical location and APMC market proximity
- **Q** = Measured quantity and visual quality assessment grade
- **M** = Current market demand and seasonal supply factors
- **H** = Historical price benchmark data

---

## 2. Technology Stack

- **React Web Frontend**: React 18, TypeScript, Vite, React Router 6, Axios, Lucide React, modern responsive UI.
- **Mobile Frontend**: React Native, Expo, TypeScript.
- **Backend**: NestJS, Node.js, REST APIs, TypeORM, Passport, JWT authentication, bcrypt password hashing.
- **Database**: PostgreSQL with TypeORM entities and SQL migrations.
- **AI Computer Vision Service**: Python 3.14, FastAPI, Pillow, NumPy, MobileNetV3 feature extraction.
- **API Documentation**: Swagger / OpenAPI 3.0 rendered on `/api/docs`.

---

## 3. Folder Structure

```
PikMoolya/
├── apps/
│   ├── web/                     # React 18 Web Frontend
│   │   ├── src/
│   │   │   ├── components/      # Navbar, Sidebar, ProductCard, SearchBar, FilterPanel, etc.
│   │   │   ├── context/         # AuthContext for JWT authentication
│   │   │   ├── pages/           # Home, About, Marketplace, Farmer/Buyer Dashboards
│   │   │   └── services/        # Axios API client
│   │   └── package.json
│   ├── mobile/                  # React Native Expo Mobile App
│   │   ├── App.tsx              # Guided 9-step Add Produce wizard & camera feature
│   │   └── package.json
│   ├── api/                     # NestJS Backend API Service
│   │   ├── src/
│   │   │   ├── ai/              # AI Price Prediction & Quality Assessment APIs
│   │   │   ├── auth/            # JWT authentication & Passport strategy
│   │   │   ├── produce/         # Produce listing management & inventory transactions
│   │   │   ├── products/        # Marketplace products & search filter APIs
│   │   │   ├── buyer-matching/  # Quantity matching algorithm
│   │   │   ├── orders/          # Order management & partial quantity sales
│   │   │   └── main.ts          # Global NestJS bootstrap & Swagger OpenAPI
│   │   └── package.json
│   └── ai-service/              # Python FastAPI Computer Vision AI Service
│       ├── main.py              # Real visual image quality analysis engine
│       └── dataset_manifest.json# ICAR & APMC agricultural dataset metadata
├── database/
│   └── migrations/              # SQL migrations (001 to 004)
├── package.json
└── README.md
```

---

## 4. Environment Variables (`apps/api/.env`)

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YourPassword
DB_NAME=pikmoolya

JWT_SECRET=PikMoolya_dev_secret_9xK7mQ2vR8zL5pN4
JWT_EXPIRES_IN=7d

AI_SERVICE_URL=http://localhost:8000
```

---

## 5. Setup & Running the Application

### 1. Database Setup (PostgreSQL)
Create the PostgreSQL database and execute the migrations:
```sql
CREATE DATABASE pikmoolya;
```
Apply migrations in order:
- `database/migrations/001_initial_schema.sql`
- `database/migrations/002_offer_terms.sql`
- `database/migrations/003_negotiation_ledger.sql`
- `database/migrations/004_enhanced_produce_and_matching.sql`

### 2. Start Python AI Computer Vision Service
```bash
cd apps/ai-service
python main.py
```
*(Runs on `http://localhost:8000`)*

### 3. Start NestJS Backend API
```bash
cd apps/api
npm install
npm run build
npm run start
```
*(Runs on `http://localhost:3000/api` with Swagger docs on `http://localhost:3000/api/docs`)*

### 4. Start React Web Frontend
```bash
cd apps/web
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

### 5. Start Mobile App (Optional)
```bash
cd apps/mobile
npm install
npx expo start
```

---

## 6. API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register Farmer or Buyer account |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/auth/profile` | Get current authenticated profile |
| `POST` | `/api/ai/price-prediction` | Calculate fair price based on $P_f = f(C,L,Q,M,H)$ |
| `POST` | `/api/ai/quality-assessment` | Computer vision visual quality analysis |
| `GET` | `/api/products` | Search & filter products (search, crop, price, location, quality, pagination) |
| `GET` | `/api/products/:id` | Get product details with seller vs AI price comparison |
| `POST` | `/api/products` | Create produce product (Farmers only) |
| `POST` | `/api/produce/:id/publish` | Publish listing to marketplace |
| `POST` | `/api/buyer-matching/match` | Quantity-matching algorithm |
| `POST` | `/api/offers` | Make buyer offer |
| `POST` | `/api/offers/:id/accept` | Accept buyer offer |
| `POST` | `/api/orders` | Create order & update inventory atomically |
| `GET` | `/api/orders` | Get user order history |

---

## 7. Remaining TODOs for Production ML Model Training

1. **Transfer Learning Retraining**:
   - Train MobileNetV3 / EfficientNet models on full ICAR and MSAMB APMC image corpora.
2. **Sensor Integration**:
   - Connect Bluetooth digital weighing scales and digital moisture sensors for automated verified weight and chemical testing.
3. **Automated Pipeline Deployment**:
   - Implement automated model evaluation against holdout test sets before production container deployment.
