import { validationResult } from "express-validator"
import { ApiError } from "../utils/ApiError.js"

// Runs after express-validator chains; throws a 400 with field details on failure.
export function validate(req, _res, next) {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    const details = result.array().map((e) => ({ field: e.path, message: e.msg }))
    throw new ApiError(400, "Validation failed", details)
  }
  next()
}
