import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
    },
    stripePriceId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "trialing"],
      default: "incomplete",
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

import { tenantScopePlugin } from "../middleware/tenantScopePlugin.js";

subscriptionSchema.plugin(tenantScopePlugin);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
