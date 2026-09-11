import { Router } from "express"
import {
  listArtists,
  getArtist,
  createArtist,
  updateArtist,
  deleteArtist,
} from "../controllers/artistController.js"
import { protect, adminOnly } from "../middleware/auth.js"
import { uploadImage } from "../middleware/upload.js"
import { validate } from "../middleware/validate.js"
import { artistRules } from "../validators/index.js"

const router = Router()

router.get("/", listArtists)
router.get("/:id", getArtist)

router.post("/", protect, adminOnly, uploadImage, artistRules, validate, createArtist)
router.put("/:id", protect, adminOnly, uploadImage, updateArtist)
router.delete("/:id", protect, adminOnly, deleteArtist)

export default router
