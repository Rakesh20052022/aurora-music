import multer from "multer"
import { ApiError } from "../utils/ApiError.js"

// Keep files in memory; the storage provider decides where they finally land.
const memoryStorage = multer.memoryStorage()

const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/flac", "audio/x-m4a", "audio/mp4"]
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

function fileFilter(req, file, cb) {
  if (file.fieldname === "audio" && AUDIO_TYPES.includes(file.mimetype)) return cb(null, true)
  if (file.fieldname === "cover" && IMAGE_TYPES.includes(file.mimetype)) return cb(null, true)
  if (file.fieldname === "image" && IMAGE_TYPES.includes(file.mimetype)) return cb(null, true)
  cb(new ApiError(400, `Unsupported file type for field "${file.fieldname}": ${file.mimetype}`))
}

export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
})

// Song upload accepts an audio file and an optional cover image.
export const uploadSongFiles = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
])

export const uploadCover = upload.single("cover")
export const uploadImage = upload.single("image")
