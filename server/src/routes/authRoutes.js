import { Router } from "express"
import { register, login, me } from "../controllers/authController.js"
import { protect } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { registerRules, loginRules } from "../validators/index.js"

const router = Router()

router.post("/register", registerRules, validate, register)
router.post("/login", loginRules, validate, login)
router.get("/me", protect, me)

export default router
