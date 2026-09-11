import { Router } from "express"
import {
  listSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  registerPlay,
} from "../controllers/songController.js"
import { protect, adminOnly } from "../middleware/auth.js"
import { uploadSongFiles } from "../middleware/upload.js"
import { validate } from "../middleware/validate.js"
import { songRules } from "../validators/index.js"

const router = Router()

router.get("/", listSongs)
router.get("/:id", getSong)
router.post("/:id/play", registerPlay)

router.post("/", protect, adminOnly, uploadSongFiles, songRules, validate, createSong)
router.put("/:id", protect, adminOnly, uploadSongFiles, updateSong)
router.delete("/:id", protect, adminOnly, deleteSong)

export default router
