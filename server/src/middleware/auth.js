import { verifyToken } from "../utils/token.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/User.js"

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) throw new ApiError(401, "Authentication required")

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    throw new ApiError(401, "Invalid or expired token")
  }

  const user = await User.findById(payload.id)
  if (!user) throw new ApiError(401, "User no longer exists")

  req.user = user
  next()
})

export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Admin access required")
  }
  next()
}
