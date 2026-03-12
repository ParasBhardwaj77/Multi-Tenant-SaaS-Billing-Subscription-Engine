import express from "express"
import { getUsers, inviteUser } from "../controllers/userController.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { authorizeRoles } from "../middleware/roleMiddleware.js"
import { checkApiLimit, recordApiUsage } from "../middleware/usageMiddleware.js"

const router = express.Router()

router.get(
  "/",
  authenticate, checkApiLimit, recordApiUsage,
  authorizeRoles("owner", "admin"),
  getUsers
)

router.post(
  "/invite",
  authenticate, checkApiLimit, recordApiUsage,
  authorizeRoles("owner", "admin"),
  inviteUser
)

export default router