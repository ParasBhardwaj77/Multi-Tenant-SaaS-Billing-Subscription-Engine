import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tenant/Company name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    billingEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    plan: {
      tier: { type: String, default: "free" },
      seatsAllowed: { type: Number, default: 3 },
      storageGB: { type: Number, default: 1 },
      apiBudget: { type: Number, default: 1000 }
    },
    status: {
      type: String,
      enum: ["active", "suspended", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Tenant = mongoose.model("Tenant", tenantSchema);

export default Tenant;