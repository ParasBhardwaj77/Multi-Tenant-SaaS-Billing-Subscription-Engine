# Multi-Tenant SaaS Billing Engine

A robust, multi-tenant Node.js + Express backend designed to handle SaaS subscriptions, usage metering, and tenant-isolated operations using Stripe and MongoDB.

## Features

- **Multi-Tenancy**: Data isolation at the model level; each user belongs to a Tenant, and queries are strictly scoped.
- **Authentication & Authorization**: JWT-based login, role-based access control (`owner`, `admin`, `member`), and MongoDB Transactions for secure organization creation.
- **Stripe Billing Integration**: Automated Stripe customer creation, plan subscriptions, and plan upgrading/downgrading.
- **Webhook Idempotency**: Stripe webhook handler securely tracks events to prevent duplicate processing (e.g., handling `invoice.paid`).
- **Usage Metering & Limits**: Middleware dynamically records API usage and blocks requests (429 Too Many Requests) when limits (API budgets, user seats) are exceeded.
- **Usage Analytics**: Aggregation endpoints for rendering charting data on the frontend.

## Architecture & Data Model

The database relies on MongoDB via Mongoose. Mongoose models:
- **Tenant**: Represents an organization. Tracks the Stripe Customer ID, custom billing fields (slug), and current plan usage quotas.
- **User**: Represents a team member within a Tenant. Controlled via Role-Based Access Control (RBAC).
- **Plan**: Global subscription tiers defining the pricing, Stripe Price IDs, and quotas (seats, storage, API limits).
- **Subscription**: Connects a Tenant to a Plan, synchronizing with Stripe billing cycles.
- **UsageRecord**: Metric logs tracking events (e.g., `api_calls`) to enforce plan boundaries.
- **Invoice & WebhookEvent**: Billing history and idempotency tracking.

## Environment Variables

Create a `.env` in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.../multi-tenant-saas-billing-engine
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_... 
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Seed the database (Plans)**:
   Ensure your local / cluster MongoDB is running, then seed the plans.
   ```bash
   npm run dev
   # In another terminal:
   curl -X POST http://localhost:5000/api/plans/seed
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```

## Stripe Test Setup

To test the billing functionality:
1. Log into your Stripe Dashboard and obtain API keys for **Test Mode**.
2. Create Stripe Products and Prices matching your `Plan.js` seeding logic (Free, Pro, Enterprise).
3. Test webhooks locally using the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret output by the CLI into your `.env` as `STRIPE_WEBHOOK_SECRET`.

## Testing

Jest is configured for feature testing. To run the tests:
```bash
npm test
```
*Current test suite covers Tenant Isolation, Webhook Idempotency, and API Limit enforcement.*

## Future Improvements

- Add email integration (SendGrid/Nodemailer) for `POST /api/users/invite` instead of silently creating users.
- Add tiered storage tracking (e.g., S3 byte counting) using the Usage metering middleware.
- Configure automatic plan downgrades on failed webhook invoice payments.
