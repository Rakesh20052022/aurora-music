import { ApiError } from "../utils/ApiError.js"
import { isProd } from "../config/env.js"

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500
  let message = err.message || "Internal server error"
  let details = err.details || null

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue || {})[0] || "field"
    message = `A record with that ${field} already exists`
  }
  // Mongoose validation
  if (err.name === "ValidationError") {
    statusCode = 400
    message = "Validation failed"
    details = Object.values(err.errors).map((e) => e.message)
  }

  if (statusCode >= 500) {
    console.error("[error]", err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    ...(isProd ? {} : { stack: err.stack }),
  })
}
