import Tenant from "../models/Tenant.js";
import Plan from "../models/Plan.js";

// @desc    Get current tenant profile and plan details
// @route   GET /api/tenants/me
// @access  Private
export const getCurrentTenant = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return res.status(403).json({ message: "User is not associated with a tenant" });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({
      _id: tenant._id,
      name: tenant.name,
      slug: tenant.slug,
      billingEmail: tenant.billingEmail,
      plan: tenant.plan,
      stripeCustomerId: tenant.stripeCustomerId,
      stripeSubscriptionId: tenant.stripeSubscriptionId,
      createdAt: tenant.createdAt,
      status: tenant.status,
    });
  } catch (error) {
    console.error("GetCurrentTenant Error:", error);
    res.status(500).json({ message: "Failed to fetch tenant details", error: error.message });
  }
};
