import User from "../models/User.js"
import Tenant from "../models/Tenant.js"

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      tenantId: req.tenantId
    })

    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body
    const tenantId = req.tenantId

    const tenant = await Tenant.findById(tenantId)
    if (!tenant) return res.status(404).json({ error: "Tenant not found" })
    
    // Check seat count
    const userCount = await User.countDocuments({ tenantId })
    const seatsAllowed = tenant.plan?.seatsAllowed || 3

    if (userCount >= seatsAllowed) {
      return res.status(403).json({ error: "Seat limit reached" })
    }

    const newUser = await User.create({
      name: email.split("@")[0],
      email,
      passwordHash: "pending_invite_setup", // placeholder until user sets password
      role: role || "member",
      tenantId
    })

    res.json({ message: "User invited successfully", user: newUser })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}