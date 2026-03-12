import express from "express"
import { subscribe, getInvoices, getUsage, changePlan, cancelSubscription } from "../controllers/billingController.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { authorizeRoles } from "../middleware/roleMiddleware.js"
import { checkApiLimit, recordApiUsage } from "../middleware/usageMiddleware.js"

const router = express.Router()

router.post("/subscribe", authenticate, checkApiLimit, recordApiUsage, authorizeRoles("owner"), subscribe)
router.get("/invoices", authenticate, checkApiLimit, recordApiUsage, authorizeRoles("admin", "owner"), getInvoices)
router.get("/usage", authenticate, checkApiLimit, recordApiUsage, authorizeRoles("admin", "owner"), getUsage)
router.post("/change-plan", authenticate, checkApiLimit, recordApiUsage, authorizeRoles("owner"), changePlan)
router.post("/cancel", authenticate, checkApiLimit, recordApiUsage, authorizeRoles("owner"), cancelSubscription)

export default router