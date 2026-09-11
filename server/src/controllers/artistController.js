import { Artist } from "../models/Artist.js"
import { Song } from "../models/Song.js"
import { Album } from "../models/Album.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { storage } from "../services/storage/index.js"

export const listArtists = asyncHandler(async (req, res) => {
  const artists = await Artist.find().sort({ name: 1 }).lean()
  res.json({ success: true, data: artists })
})

export const getArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.id).lean()
  if (!artist) throw new ApiError(404, "Artist not found")

  const [songs, albums] = await Promise.all([
    Song.find({ artist: artist._id })
      .populate({ path: "album", select: "title coverUrl" })
      .sort({ playCount: -1 })
      .lean(),
    Album.find({ artist: artist._id }).sort({ releaseYear: -1 }).lean(),
  ])

  res.json({ success: true, data: { ...artist, songs, albums } })
})

export const createArtist = asyncHandler(async (req, res) => {
  const { name, bio } = req.body
  let image = ""
  let imageKey = ""
  if (req.file) {
    const saved = await storage.save({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      folder: "artists",
    })
    image = saved.url
    imageKey = saved.key
  }
  const artist = await Artist.create({ name, bio: bio || "", image, imageKey })
  res.status(201).json({ success: true, data: artist })
})

export const updateArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.id)
  if (!artist) throw new ApiError(404, "Artist not found")

  const { name, bio } = req.body
  if (name !== undefined) artist.name = name
  if (bio !== undefined) artist.bio = bio
  if (req.file) {
    if (artist.imageKey) await storage.remove(artist.imageKey)
    const saved = await storage.save({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      folder: "artists",
    })
    artist.image = saved.url
    artist.imageKey = saved.key
  }
  await artist.save()
  res.json({ success: true, data: artist })
})

export const deleteArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.id)
  if (!artist) throw new ApiError(404, "Artist not found")

  const songCount = await Song.countDocuments({ artist: artist._id })
  if (songCount > 0) {
    throw new ApiError(409, `Cannot delete: ${songCount} song(s) still reference this artist`)
  }
  if (artist.imageKey) await storage.remove(artist.imageKey)
  await Album.deleteMany({ artist: artist._id })
  await artist.deleteOne()
  res.json({ success: true, message: "Artist deleted" })
})
