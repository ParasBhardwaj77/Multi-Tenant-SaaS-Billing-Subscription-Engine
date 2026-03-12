import express from "express"
import { getPlans, seedPlans } from "../controllers/planController.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { checkApiLimit, recordApiUsage } from "../middleware/usageMiddleware.js"

const router = express.Router()

// Authenticated route to get plans
router.get("/", authenticate, checkApiLimit, recordApiUsage, getPlans)

// Public or Admin-protected seed route (public for now to allow initial setup)
router.post("/seed", seedPlans)

export default router