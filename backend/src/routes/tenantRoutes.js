import express from "express";
import { getCurrentTenant } from "../controllers/tenantController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { checkApiLimit, recordApiUsage } from "../middleware/usageMiddleware.js"

const router = express.Router();

router.get("/me", authenticate, checkApiLimit, recordApiUsage, getCurrentTenant);

export default router;
