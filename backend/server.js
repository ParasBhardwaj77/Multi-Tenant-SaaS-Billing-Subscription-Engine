import "./src/config/init.js"
import express from "express"
import cors from "cors"
import connectDB from "./src/config/db.js"
import authRoutes from "./src/routes/authRoutes.js"
import userRoutes from "./src/routes/userRoutes.js"
import planRoutes from "./src/routes/planRoutes.js"
import billingRoutes from "./src/routes/billingRoutes.js"
import webhookRoutes from "./src/routes/webhookRoutes.js"
import usageRoutes from "./src/routes/usageRoutes.js"
import tenantRoutes from "./src/routes/tenantRoutes.js"

const app = express()

app.use(cors())

// Stripe webhooks MUST be processed as raw body buffers before any global JSON parsers
app.use("/api/webhooks/stripe", express.raw({ type: 'application/json' }), webhookRoutes)

// Global JSON parser for all other routes
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tenants", tenantRoutes)
app.use("/api/plans", planRoutes)
app.use("/api/billing", billingRoutes)
app.use("/api/usage", usageRoutes)

app.get("/", (req, res) => {
    res.json({
        message: "Multi-Tenant SaaS Billing API running"
    })
})

export { app }

const PORT = process.env.PORT || 5000

const startServer = async () => {
    try {
        console.log("Connecting to MongoDB...")
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

startServer()