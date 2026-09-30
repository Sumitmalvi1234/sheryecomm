# Secure E-Commerce Management Platform APIs & Admin Dashboard

A production-grade RESTful API engine built using Node.js, Express, and MongoDB, paired with a React administration control interface compiled using Vite. This application implements a strict JSON Web Token (JWT) state rotation schema using HTTP-Only cookies alongside comprehensive structural data validation constraints.

---

## 🔒 Security Architecture Highlights
- **JWT Multi-Token Architecture**: Short-lived access tokens (15-min) are delivered via JSON payloads, while long-lived refresh tokens (7-day) are persisted server-side and mounted onto the browser via secure, `httpOnly` CSRF-resistant cookies.
- **Session Revocation Validation**: Active refresh tokens are tracked directly inside the database, enabling absolute credential invalidation upon server-side user logout execution.
- **Request Data Sanitation**: Integrated `express-validator` runtime chains filter parameters, path parameters, and query criteria, sending uniform field-level `400` validation error structures to client layers.

---

## 🚀 Step-by-Step Local Deployment Installation Guide

### 1. Repository Workspace Setup
Clone the platform tracking structures to your local disk environment:
```bash
git clone <your-repository-url>
cd sheryians-ecommerce
```

### 2. Microservice Environment Configuration
Create a `.env` database system file within the `/backend` project folder path:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sheryians_ecommerce
ACCESS_TOKEN_SECRET=your_production_grade_access_hex_key_string_pattern_123!
REFRESH_TOKEN_SECRET=your_production_grade_refresh_hex_key_string_pattern_456?
```

### 3. Backend Execution Framework
Instantiate your local database daemon, download the backend package registry structures, and initialize development tracking parameters:
```bash
cd backend
npm install
npm run dev
```
*The API gateway engine will listen on: `http://localhost:5000`*

### 4. Client View Console Setup
Open an independent terminal tab window mapping into the root repository workspace directory:
```bash
cd frontend
npm install
npm run dev
```
*The administrative dashboard interface launches directly on: `http://localhost:3000` or `http://localhost:3001`*

---

## 🛣️ Production-Grade API Operational Map

| Method | Endpoint | Access Authentication | Execution Logical Scope Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public Baseline | Evaluates and parses object criteria fields to create profile entities. |
| **POST** | `/api/auth/login` | Public Baseline | Signs and distributes short access tokens and sets secure HTTP-Only cookies. |
| **POST** | `/api/auth/refresh-token` | Public Layer | Inspects cookie vectors to issue rotated access tokens dynamically. |
| **POST** | `/api/auth/logout` | Authenticated | Clears database session signatures and client browser cookies. |
| **GET** | `/api/auth/me` | Authenticated | Decodes the incoming access payload request header to return active profiles. |
| **GET** | `/api/products` | Public Baseline | Retrieves a collection of active data inventory entities sorted chronologically. |
| **GET** | `/api/products/:id` | Public Baseline | Evaluates whether target parameters match valid MongoDB ObjectID structures. |
| **POST** | `/api/products` | Authenticated | Implements robust parameter validations before persisting data. |
| **PUT** | `/api/products/:id` | Authenticated | Compares specific object identities to commit clean partial data updates. |
| **DELETE** | `/api/products/:id` | Authenticated | Verifies database record locations to execute permanent document removal. |
