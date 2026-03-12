import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    currency: {
      type: String,
      default: "usd",
    },
    interval: {
      type: String,
      enum: ["month", "year"],
      default: "month",
    },
    stripePriceId: {
      type: String,
      required: [true, "Stripe Price ID is required"],
    },
    limits: {
      seats: { type: Number, default: 0 },
      storageGB: { type: Number, default: 0 },
      apiCallsPerMonth: { type: Number, default: 0 }
    },
    features: [String],
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;