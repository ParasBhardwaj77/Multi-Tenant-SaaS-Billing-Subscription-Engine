# Multi-Tenant SaaS Billing & Subscription Engine

This project is a back-office engine for a SaaS platform featuring tenant isolation, usage metering, and Stripe-powered billing. It represents a strict multi-tenant architecture where data leakage between organizations is prevented at the middleware level, plan limits are enforced in real-time, and Stripe webhooks are processed idempotently.

---

## 1. Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Stripe Account (Test Mode)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/saas-engine
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   STRIPE_SECRET_KEY=sk_test_... 
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend proxies API requests to `http://localhost:5000` automatically.*

### Stripe Test Setup
1. In your Stripe Dashboard, ensure **Test Mode** is active.
2. Obtain your `STRIPE_SECRET_KEY` and place it in the backend `.env`.
3. To test webhooks locally, use the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret output by the CLI and save it as `STRIPE_WEBHOOK_SECRET` in your `.env`.

---

## 2. Architecture Overview

### Folder Structure
The repository is split into classic Client/Server architecture:
- `/backend`: Node.js, Express, Mongoose.
  - `/src/controllers`: Business logic for handling requests.
  - `/src/middleware`: Global and route-specific interceptors (Authentication, Tenant Isolation, Usage Tracking).
  - `/src/models`: Mongoose schemas.
  - `/src/routes`: Express route definitions.
- `/frontend`: React, Vite, TailwindCSS. 
  - Glassmorphic UI dashboard built with `lucide-react` icons and `recharts` for usage analytics.

### Library Rationale
- **Express & Node.js**: Fast, unopinionated routing suitable for custom middleware chaining (e.g. usage metering and tenant injection).
- **Mongoose**: Provides schema validation and the ability to write global plugins (used here for strict Tenant Isolation).
- **Stripe SDK**: Official package for processing subscriptions and webhook signature verification securely.
- **React & TailwindCSS**: Chosen for rapid component development and implementing a modern, premium UI.

---

## 3. Data Model / ERD

```text
[ Tenant ] 1 ------ * [ User ]
    |
    | 1 ------ * [ Subscription ]
    |
    | 1 ------ * [ UsageRecord ]
    |
    | 1 ------ * [ Invoice ]

[ Plan ] 1 ------ * [ Subscription ]
```

### Schema Descriptions
- **Tenant**: The core organization object. Contains `stripeCustomerId`, limits mapping from the plan, and `status` (`active`, `suspended`).
- **User**: Belongs to a single Tenant. Contains authentication credentials and Role-Based Access Control (`owner`, `admin`, `member`).
- **Plan**: Defines pricing, interval, `stripePriceId`, and hard capability limits (`seats`, `storageGB`, `apiCallsPerMonth`).
- **Subscription**: The active linkage between a Tenant and a Plan. Managed strictly by Stripe webhooks.
- **UsageRecord**: Metric logs tracking events (e.g., `api_calls`) to enforce plan boundaries. Indexed optimally for time-series aggregation.
- **Invoice**: A historical record of billing periods and PDF links, generated via Stripe Paid webhooks.
- **WebhookEvent**: A globally unique record of a `stripeEventId` used to guarantee idempotency and prevent double-processing.

---

## 4. Core Feature Explanation (Trickiest Architectural Decision)

**Tenant Isolation Middleware via AsyncLocalStorage**
The trickiest architectural requirement was enforcing that *every* Mongoose query naturally includes a `tenantId` without requiring the developer to remember to write `{ tenantId: req.tenantId }` in every controller. 

*The Solution*: We utilized Node.js `AsyncLocalStorage` paired with a custom Mongoose Plugin (`tenantScopePlugin.js`).
1. When a JWT is authenticated, `authMiddleware.js` opens an `AsyncLocalStorage` context and injects the extracted `tenantId`.
2. The `tenantScopePlugin.js` intercepts all Mongoose query methods (e.g., `pre('find')`, `pre('aggregate')`, `pre('save')`).
3. It retrieves the `tenantId` from the active asynchronous context and automatically appends it to the query filter. 

*Justification*: This achieves true middleware-enforced isolation. Even if a developer accidentally writes `User.find({})`, the plugin forcefully mutates it to `User.find({ tenantId: '...' })`, eliminating the risk of cross-tenant data leakage entirely.

---

## 5. API Documentation

### Authentication Endpoints
- **`POST /api/auth/register`**
  - **Description**: Atomically creates a Tenant and Owner via MongoDB Transactions. Also registers the customer in Stripe.
  - **Request**: `{ "companyName": "Acme", "email": "admin@acme.com", "password": "pass" }`
  - **Response**: `{ "token": "jwt...", "user": { ... } }`

- **`POST /api/auth/login`**
  - **Description**: Authenticates a user and returns a JWT containing `tenantId` and `role` claims.

### Tenant & User Endpoints
- **`GET /api/tenants/me` (JWT)**
  - **Description**: Fetches current tenant profile, active plan limits, and suspension status.
- **`POST /api/users/invite` (JWT, Admin+)**
  - **Description**: Invites a new seat. Rejects with `403` if the tenant's `plan.seatsAllowed` limit is reached.
- **`GET /api/users` (JWT, Admin+)**
  - **Description**: Lists tenant users. Automatically scoped by the Tenant Isolation plugin.

### Billing & Usage Endpoints
- **`GET /api/billing/usage` (JWT, Admin+)**
  - **Description**: Automatically increments the API call meter (via `recordApiUsage` middleware) and returns the aggregated current period usage vs limits.
- **`GET /api/usage/report` (JWT, Admin+)**
  - **Description**: Aggregates API metrics by day using a MongoDB aggregation pipeline for charting.
- **`POST /api/webhooks/stripe`**
  - **Description**: Idempotent endpoint for processing Stripe events (`invoice.payment_failed` suspends the tenant and caps usage).

*Note: All authenticated routes traverse the `checkApiLimit` middleware, returning `HTTP 429 Retry-After` if the monthly budget is exceeded.*

---

## 6. Testing

*(Note: Per specific project instructions, test files were intentionally excluded from this iteration.)*

In a fully realized setup, testing covers:
1. **Cross-Tenant Isolation**: Injecting an invalid `tenantId` via a forged valid JWT to assert that `tenantScopePlugin` blocks data spillage.
2. **Webhook Idempotency**: Delivering identical `invoice.paid` payloads twice and asserting the database only creates one invoice.
3. **Usage Enforcement**: Bombarding an endpoint with looping requests and asserting a `429 Too Many Requests` status is hit precisely at the plan limit.

---

## 7. Future Considerations

With more time, the system would benefit from:
- **Email Integration**: Sending actual MIME emails via SendGrid/AWS SES for `POST /api/users/invite` instead of relying on link generation.
- **Tiered Storage Analytics**: Moving beyond counting API hits to physically checking S3 bucket byte sizes to populate the `storage_gb` usage limits.
- **Granular Feature Flags**: Adding boolean toggles to the `Plan` schema to disable specific UI routes entirely when users downgrade to lower tiers.
