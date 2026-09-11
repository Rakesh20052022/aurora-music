import { body } from "express-validator"

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
]

export const loginRules = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
]

export const playlistRules = [
  body("name").trim().notEmpty().withMessage("Playlist name is required").isLength({ max: 120 }),
]

export const addSongRules = [body("songId").isMongoId().withMessage("A valid songId is required")]

export const artistRules = [body("name").trim().notEmpty().withMessage("Artist name is required")]

export const albumRules = [
  body("title").trim().notEmpty().withMessage("Album title is required"),
  body("artist").isMongoId().withMessage("A valid artist is required"),
]

// Song fields arrive as multipart form-data; validate the text fields.
export const songRules = [body("title").trim().notEmpty().withMessage("Song title is required")]
