import { Router } from "express"
import {
  listMyPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSong,
  removeSong,
} from "../controllers/playlistController.js"
import { protect } from "../middleware/auth.js"
import { uploadCover } from "../middleware/upload.js"
import { validate } from "../middleware/validate.js"
import { playlistRules, addSongRules } from "../validators/index.js"

const router = Router()

router.use(protect)

router.get("/", listMyPlaylists)
router.post("/", uploadCover, playlistRules, validate, createPlaylist)
router.get("/:id", getPlaylist)
router.put("/:id", uploadCover, updatePlaylist)
router.delete("/:id", deletePlaylist)

router.post("/:id/songs", addSongRules, validate, addSong)
router.delete("/:id/songs/:songId", removeSong)

export default router
