import stripe from "../config/stripe.js";

export const createStripeCustomer = async (name, email) => {
  return await stripe.customers.create({
    name,
    email,
    source: "tok_visa" // Automatically attaches a test visa card
  });
};

export const updateStripeCustomerMetadata = async (customerId, metadata) => {
  return await stripe.customers.update(customerId, { metadata });
};

export const createStripeSubscription = async (customerId, priceId) => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }]
  });
};

export const getStripeSubscription = async (subscriptionId) => {
  return await stripe.subscriptions.retrieve(subscriptionId);
};

export const updateStripeSubscriptionPrice = async (subscriptionId, oldItemId, newPriceId) => {
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: oldItemId,
      price: newPriceId,
    }],
  });
};

export const cancelStripeSubscriptionAtPeriodEnd = async (subscriptionId) => {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
};
