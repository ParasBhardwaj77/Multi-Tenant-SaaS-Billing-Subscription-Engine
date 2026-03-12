import Plan from "../models/Plan.js"

export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find()
    res.json(plans)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const seedPlans = async (req, res) => {
  try {
    const plans = [
      {
        name: "Free",
        price: 0,
        interval: "month",
        stripePriceId: "price_free_placeholder",
        limits: { seats: 3, storageGB: 1, apiCallsPerMonth: 1000 },
        features: ["3 Seats", "1GB Storage", "1000 API Calls/mo"],
      },
      {
        name: "Pro",
        price: 20,
        interval: "month",
        stripePriceId: "price_pro_placeholder",
        limits: { seats: 10, storageGB: 10, apiCallsPerMonth: 10000 },
        features: ["10 Seats", "10GB Storage", "10000 API Calls/mo"],
      },
      {
        name: "Enterprise",
        price: 100,
        interval: "month",
        stripePriceId: "price_enterprise_placeholder",
        limits: { seats: 50, storageGB: 100, apiCallsPerMonth: 100000 },
        features: ["50 Seats", "100GB Storage", "100000 API Calls/mo"],
      }
    ]

    await Plan.deleteMany()
    const createdPlans = await Plan.insertMany(plans)

    res.json({
      message: "Plans seeded successfully",
      plans: createdPlans
    })
  } catch (error) {
    console.error("Seed error:", error)
    res.status(500).json({ error: error.message })
  }
}