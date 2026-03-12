import stripe from "../config/stripe.js";
import WebhookEvent from "../models/WebhookEvent.js";
import Subscription from "../models/Subscription.js";
import Tenant from "../models/Tenant.js";
import Invoice from "../models/Invoice.js";

export const handleStripeWebhook = async (req, res) => {
  console.log("=== WEBHOOK RECEIVED ===")
  console.log("Headers attached:", !!req.headers["stripe-signature"])
  console.log("Body exists:", !!req.body)
  console.log("Body is Buffer?", Buffer.isBuffer(req.body))

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Requires raw request body
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Stripe signature verified! Event type:", event.type)
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency check: Ignore duplicate events
  const existingEvent = await WebhookEvent.findOne({ stripeEventId: event.id });
  if (existingEvent) {
    console.log(`Step 9: Webhook ${event.id} already processed. Ignoring.`);
    return res.status(200).json({ received: true, message: "Already processed" });
  }

  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date(),
            currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        );
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const tenant = await Tenant.findOne({ stripeCustomerId: invoice.customer });
        
        if (tenant) {
          await Invoice.create({
            tenantId: tenant._id,
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_paid || invoice.amount_due,
            currency: invoice.currency,
            status: invoice.status,
            pdfUrl: invoice.hosted_invoice_url,
            periodStart: new Date(invoice.period_start * 1000),
            periodEnd: new Date(invoice.period_end * 1000),
          });

          if (event.type === "invoice.payment_failed") {
            // Downgrade tenant to free tier limits and suspend
            await Tenant.findByIdAndUpdate(tenant._id, {
              status: "suspended",
              "plan.tier": "free",
              "plan.seatsAllowed": 3, // Block new invites past 3
              "plan.storageGB": 1,
              "plan.apiBudget": 1000 // Cap usage at free-tier
            });
            
            // Mark active subscriptions as past due
            await Subscription.updateMany(
              { tenantId: tenant._id, status: "active" },
              { status: "past_due" }
            );
          }
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Mark as processed for idempotency
    await WebhookEvent.create({
      stripeEventId: event.id,
      type: event.type,
      payload: event.data.object,
      status: "processed",
      processedAt: new Date()
    });

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing failed:", err);
    res.status(500).send("Webhook processing error");
  }
};
