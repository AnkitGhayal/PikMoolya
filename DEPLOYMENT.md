# PikMoolya Free Public Deployment Guide

This guide details the exact step-by-step deployment instructions for hosting PikMoolya across free-tier cloud platforms:
- **Neon**: Serverless PostgreSQL Database
- **Render**: NestJS Backend API & Python FastAPI AI Service
- **Vercel**: React + Vite Web Frontend

---

## 1. Database Setup: Neon (PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and sign up / log in to your free account.
2. Click **Create Project**:
   - **Project Name**: `pikmoolya-db`
   - **Postgres Version**: `16` (or latest recommended)
   - **Region**: Select the region closest to your users (e.g., `AWS ap-south-1 Mumbai` or `AWS us-east-2`).
3. Once created, copy the **Connection String** from the Neon dashboard:
   - Format: `postgresql://[user]:[password]@[neon-host]/[dbname]?sslmode=require`
4. Apply Database Migrations:
   - **Option A (Automated CLI)**: From your local terminal or CI/CD, run:
     ```bash
     cd apps/api
     DATABASE_URL="your-neon-connection-string" npm run db:migrate
     ```
   - **Option B (Neon SQL Editor)**: Open the **SQL Editor** tab in the Neon dashboard and execute the 4 migration scripts in order:
     1. `database/migrations/001_initial_schema.sql`
     2. `database/migrations/002_offer_terms.sql`
     3. `database/migrations/003_negotiation_ledger.sql`
     4. `database/migrations/004_enhanced_produce_and_matching.sql`

---

## 2. AI Service: Render (Python FastAPI)

1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Web Service**.
2. Connect your PikMoolya Git repository.
3. Configure the Web Service settings:
   - **Name**: `pikmoolya-ai`
   - **Region**: Same region or close to your database
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `apps/ai-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Environment Variables:
   | Key | Value | Notes |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.0` | Recommended runtime version |
5. Click **Create Web Service**. Once deployed, copy your public service URL (e.g. `https://pikmoolya-ai.onrender.com`).

---

## 3. Backend API: Render (NestJS)

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect the same Git repository.
3. Configure the Web Service settings:
   - **Name**: `pikmoolya-api`
   - **Region**: Same region as database & AI service
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Health Check Path**: `/api/health`
   - **Plan**: `Free`
4. Environment Variables:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `DATABASE_URL` | `postgresql://...` | Connection string copied from Neon |
   | `JWT_SECRET` | *(click Generate or random 32+ char string)* | Token encryption secret |
   | `AI_SERVICE_URL` | `https://pikmoolya-ai.onrender.com` | Public URL of deployed AI service |
   | `CORS_ORIGIN` | `https://pikmoolya.vercel.app` | (Optional: leave unset to allow any origin) |
5. Click **Create Web Service**. Once deployed, copy your API URL (e.g. `https://pikmoolya-api.onrender.com`).

*(Note: Alternatively, if using Render Blueprints, connecting the repository will automatically detect the root `render.yaml` file).*

---

## 4. Frontend Application: Vercel (React + Vite)

1. Go to [vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your PikMoolya Git repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `apps/web`
   - **Build Command**: `npm run build` (or `tsc && vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Environment Variables:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://pikmoolya-api.onrender.com/api` | Direct URL to Render backend API |
5. Click **Deploy**. Vercel will bundle the production assets and issue a free `*.vercel.app` URL.

---

## 5. Post-Deployment Verification Checklist

- [ ] Visit `https://pikmoolya-ai.onrender.com/health` -> should return `{"status": "ok"}`.
- [ ] Visit `https://pikmoolya-api.onrender.com/api/crops` -> should return JSON crop benchmarks.
- [ ] Visit `https://pikmoolya.vercel.app` -> verify Home page renders with live data.
- [ ] Log in with demo accounts (Farmer: `+919876543210` / `Farmer@12345` or Buyer: `+919123456789` / `Buyer@12345`).
- [ ] Browse marketplace, run price prediction, and test order creation.
