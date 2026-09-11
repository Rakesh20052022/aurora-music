import { Router } from "express"
import {
  listAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "../controllers/albumController.js"
import { protect, adminOnly } from "../middleware/auth.js"
import { uploadCover } from "../middleware/upload.js"
import { validate } from "../middleware/validate.js"
import { albumRules } from "../validators/index.js"

const router = Router()

router.get("/", listAlbums)
router.get("/:id", getAlbum)

router.post("/", protect, adminOnly, uploadCover, albumRules, validate, createAlbum)
router.put("/:id", protect, adminOnly, uploadCover, updateAlbum)
router.delete("/:id", protect, adminOnly, deleteAlbum)

export default router
