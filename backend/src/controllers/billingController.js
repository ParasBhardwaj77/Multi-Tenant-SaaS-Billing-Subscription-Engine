import { 
  createStripeCustomer, 
  createStripeSubscription, 
  getStripeSubscription, 
  updateStripeSubscriptionPrice, 
  cancelStripeSubscriptionAtPeriodEnd 
} from "../services/stripeService.js"
import Tenant from "../models/Tenant.js"
import Plan from "../models/Plan.js"
import Subscription from "../models/Subscription.js"
import Invoice from "../models/Invoice.js"
import UsageRecord from "../models/UsageRecord.js"

export const subscribe = async (req, res) => {
  try {
    const { planId } = req.body
    const tenantId = req.tenantId

    const tenant = await Tenant.findById(tenantId)
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" })
    }

    const plan = await Plan.findById(planId)
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" })
    }

    // Use existing Stripe customer ID or create one if missing
    let stripeCustomerId = tenant.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(tenant.name, null);
      await updateStripeCustomerMetadata(customer.id, { tenantId: tenant._id.toString() });
      stripeCustomerId = customer.id
      tenant.stripeCustomerId = stripeCustomerId
    }

    const stripeSubscription = await createStripeSubscription(stripeCustomerId, plan.stripePriceId);

    const newSubscription = await Subscription.create({
      tenantId,
      planId: plan._id,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      currentPeriodStart: stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : new Date(),
      currentPeriodEnd: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default +30 days
    })

    // Update tenant with plan details
    tenant.plan = {
      tier: plan.name,
      seatsAllowed: plan.limits?.seats || 0,
      storageGB: plan.limits?.storageGB || 0,
      apiBudget: plan.limits?.apiCallsPerMonth || 0
    }

    await tenant.save()

    res.json({
      message: "Subscription created",
      subscription: newSubscription
    })
  } catch (error) {
    console.error("Subscription error:", error)
    res.status(500).json({ error: error.message })
  }
}

export const getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const invoices = await Invoice.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Invoice.countDocuments({ tenantId: req.tenantId })

    res.json({
      invoices,
      page,
      pages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUsage = async (req, res) => {
  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const usageResult = await UsageRecord.aggregate([
      {
        $match: {
          tenantId: req.tenantId,
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
    ])

    const currentUsage = usageResult.length > 0 ? usageResult[0].totalUsage : 0
    const tenant = await Tenant.findById(req.tenantId)

    res.json({
      currentUsage,
      limit: tenant.plan?.apiBudget || 1000
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const changePlan = async (req, res) => {
  try {
    const { newPlanId } = req.body
    const tenant = await Tenant.findById(req.tenantId)
    const newPlan = await Plan.findById(newPlanId)

    if (!newPlan) return res.status(404).json({ error: "Plan not found" })

    const subscription = await Subscription.findOne({ tenantId: req.tenantId, status: "active" })
    if (!subscription) return res.status(404).json({ error: "No active subscription found" })

    const stripeSubscription = await getStripeSubscription(subscription.stripeSubscriptionId)

    await updateStripeSubscriptionPrice(
      subscription.stripeSubscriptionId, 
      stripeSubscription.items.data[0].id, 
      newPlan.stripePriceId
    )

    tenant.plan.tier = newPlan.name
    tenant.plan.seatsAllowed = newPlan.limits?.seats || 0
    tenant.plan.storageGB = newPlan.limits?.storageGB || 0
    tenant.plan.apiBudget = newPlan.limits?.apiCallsPerMonth || 0

    await tenant.save()
    
    subscription.planId = newPlan._id;
    await subscription.save();

    res.json({ message: "Plan changed successfully", newPlan: newPlan.name })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ tenantId: req.tenantId, status: "active" })
    if (!subscription) return res.status(404).json({ error: "No active subscription found" })

    await cancelStripeSubscriptionAtPeriodEnd(subscription.stripeSubscriptionId)

    subscription.cancelAtPeriodEnd = true
    await subscription.save()

    res.json({ message: "Subscription set to cancel at period end" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}