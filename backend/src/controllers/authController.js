import mongoose from "mongoose";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { generateToken } from "../utils/authUtils.js";
import { createStripeCustomer, updateStripeCustomerMetadata } from "../services/stripeService.js";

// @desc    Register a new user and tenant
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, companyName, email, password, role } = req.body;

    // Support both 'name' (user) and 'companyName' (tenant)
    if (!email || !password || (!name && !companyName)) {
      return res.status(400).json({ 
        message: "Please provide companyName (or name), email, and password" 
      });
    }

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: "Email already in use" });
    }

    let tenantId = null;
    let stripeCustomerId = null;

    if (companyName) {
      // 1. Create Stripe customer (might fail if API key is invalid, so do it before DB write if possible, or handle error)
      let customer;
      try {
        customer = await createStripeCustomer(companyName, email);
        stripeCustomerId = customer.id;
      } catch (stripeError) {
        // If Stripe fails (e.g., bad API key), we can either abort or create without Stripe ID.
        // Given we are testing with a placeholder, we might want to let it proceed without a stripe ID
        // or just throw the error. Let's throw the error so the transaction aborts.
        throw stripeError;
      }

      // 2. Create Tenant
      const [tenant] = await Tenant.create([{ 
        name: companyName,
        billingEmail: email,
        stripeCustomerId: stripeCustomerId
      }], { session });

      tenantId = tenant._id;
      
      // Update Stripe customer metadata with tenantId
      await updateStripeCustomerMetadata(stripeCustomerId, { tenantId: tenant._id.toString() });
    }

    // If name is not provided, default to companyName or "Owner"
    const userName = name || companyName || "Owner";

    // 3. Create User
    const [user] = await User.create([{ 
      name: userName, 
      email, 
      passwordHash: password, // Mapped to the new field name
      role: role || (companyName ? "owner" : "user"),
      tenantId 
    }], { session });

    await session.commitTransaction();
    session.endSession();

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        companyName: companyName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Register error:", error);
    // Return Stripe errors clearly if it's an API key issue
    if (error.type === 'StripeAuthenticationError') {
      return res.status(500).json({ error: "Invalid Stripe API Key provided. Please update your .env file." });
    }
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};