import { User } from "../models/User.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { signToken } from "../utils/token.js"
import { env } from "../config/env.js"

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  const normalizedEmail = email.toLowerCase().trim()

  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) throw new ApiError(409, "An account with that email already exists")

  // First registered user, or the configured ADMIN_EMAIL, becomes admin.
  const userCount = await User.estimatedDocumentCount()
  const role = userCount === 0 || normalizedEmail === env.adminEmail ? "admin" : "user"

  const user = await User.create({ name, email: normalizedEmail, password, role })
  const token = signToken(user)

  res.status(201).json({ success: true, token, user: user.toSafeJSON() })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password")
  if (!user) throw new ApiError(401, "Invalid email or password")

  const match = await user.comparePassword(password)
  if (!match) throw new ApiError(401, "Invalid email or password")

  const token = signToken(user)
  res.json({ success: true, token, user: user.toSafeJSON() })
})

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("likedSongs")
    .populate("playlists")
  res.json({ success: true, user: user.toSafeJSON() })
})
