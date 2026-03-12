import UsageRecord from "../models/UsageRecord.js";
import Tenant from "../models/Tenant.js";

// Middleware to check if the tenant has exceeded their API budget
export const checkApiLimit = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      // If the route is not tenant-protected, skip limit check
      return next();
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found for usage check" });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usageResult = await UsageRecord.aggregate([
      {
        $match: {
          tenantId: tenant._id,
          metric: "api_calls",
          recordedAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: "$value" }
        }
      }
    ]);

    const currentUsage = usageResult.length > 0 ? usageResult[0].totalUsage : 0;
    const apiBudget = tenant.plan?.apiBudget || 1000;

    if (currentUsage >= apiBudget) {
      res.set("Retry-After", "86400"); // Block for 1 day or until billing cycle resets
      return res.status(429).json({ error: "API usage limit exceeded for current plan" });
    }

    next();
  } catch (error) {
    console.error("Usage limit check failed:", error);
    res.status(500).json({ error: "Failed to verify usage limits" });
  }
};

// Middleware to record API usage after a successful request
export const recordApiUsage = async (req, res, next) => {
  // Use a response finish listener to only record if we eventually succeed,
  // or just run it asynchronously right away. We'll run it async right away
  // as the request processing begins, per typical rate limit counters.
  try {
    if (req.tenantId) {
      await UsageRecord.create({
        tenantId: req.tenantId,
        metric: "api_calls",
        value: 1
      });
    }
  } catch (error) {
    console.error("Failed to record API usage:", error);
  }
  next();
};
