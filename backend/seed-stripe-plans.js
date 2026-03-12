import dotenv from "dotenv"
import mongoose from "mongoose"
import Stripe from "stripe"
import Plan from "./src/models/Plan.js"

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const seedRealStripePlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Clear existing plans
    await Plan.deleteMany({})
    console.log("Cleared old placeholder plans")

    const plansToCreate = [
      {
        name: "Free",
        priceInDollars: 0,
        interval: "month",
        limits: { seats: 3, storageGB: 1, apiCallsPerMonth: 1000 },
        features: ["3 Seats", "1GB Storage", "1000 API Calls/mo"],
      },
      {
        name: "Pro",
        priceInDollars: 20,
        interval: "month",
        limits: { seats: 10, storageGB: 10, apiCallsPerMonth: 10000 },
        features: ["10 Seats", "10GB Storage", "10000 API Calls/mo"],
      },
      {
        name: "Enterprise",
        priceInDollars: 100,
        interval: "month",
        limits: { seats: 50, storageGB: 100, apiCallsPerMonth: 100000 },
        features: ["50 Seats", "100GB Storage", "100000 API Calls/mo"],
      }
    ]

    for (const planData of plansToCreate) {
      console.log(`Creating Stripe Product for ${planData.name}...`)
      // 1. Create a Product in Stripe
      const product = await stripe.products.create({
        name: `${planData.name} Tier`,
        description: `SaaS ${planData.name} Subscription Plan`
      })

      // 2. Create a Recurring Price for the Product in Stripe
      // unit_amount is in cents (so dollars * 100)
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: planData.priceInDollars * 100,
        currency: "usd",
        recurring: { interval: planData.interval },
      })

      // 3. Save to our MongoDB with the REAL stripe price ID
      const newMongoosePlan = await Plan.create({
        name: planData.name,
        price: planData.priceInDollars,
        interval: planData.interval,
        stripePriceId: price.id,
        limits: planData.limits,
        features: planData.features,
      })

      console.log(`✅ Saved ${planData.name} Plan! MongoDB ID: ${newMongoosePlan._id} | Stripe Price: ${price.id}`)
    }

    console.log("\nAll plans seeded successfully with real Stripe IDs!")
    process.exit(0)
  } catch (error) {
    console.error("Failed to seed real Stripe plans:", error)
    process.exit(1)
  }
}

seedRealStripePlans()
