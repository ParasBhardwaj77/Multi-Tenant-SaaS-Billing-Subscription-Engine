import express from "express"
import { getUsageReport } from "../controllers/usageController.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { checkApiLimit, recordApiUsage } from "../middleware/usageMiddleware.js"
import { authorizeRoles } from "../middleware/roleMiddleware.js"

const router = express.Router()

router.get("/report", authenticate, checkApiLimit, recordApiUsage, authorizeRoles("admin", "owner"), getUsageReport)

export default router
