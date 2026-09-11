import { Router } from "express"
import {
  getLikedSongs,
  likeSong,
  unlikeSong,
  getRecentlyPlayed,
  pushRecentlyPlayed,
  updatePreferences,
  updateProfile,
} from "../controllers/userController.js"
import { protect } from "../middleware/auth.js"

const router = Router()

router.use(protect)

router.put("/me", updateProfile)
router.put("/me/preferences", updatePreferences)

router.get("/me/liked", getLikedSongs)
router.post("/me/liked/:songId", likeSong)
router.delete("/me/liked/:songId", unlikeSong)

router.get("/me/recent", getRecentlyPlayed)
router.post("/me/recent/:songId", pushRecentlyPlayed)

export default router
