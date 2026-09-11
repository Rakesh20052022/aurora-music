import { Album } from "../models/Album.js"
import { Song } from "../models/Song.js"
import { Artist } from "../models/Artist.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { storage } from "../services/storage/index.js"

const POPULATE = { path: "artist", select: "name image" }

export const listAlbums = asyncHandler(async (req, res) => {
  const albums = await Album.find().populate(POPULATE).sort({ createdAt: -1 }).lean()
  res.json({ success: true, data: albums })
})

export const getAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id)
    .populate(POPULATE)
    .populate({
      path: "songs",
      populate: [
        { path: "artist", select: "name image" },
        { path: "album", select: "title coverUrl" },
      ],
    })
    .lean()
  if (!album) throw new ApiError(404, "Album not found")
  res.json({ success: true, data: album })
})

export const createAlbum = asyncHandler(async (req, res) => {
  const { title, artist, releaseYear } = req.body
  const artistDoc = await Artist.findById(artist)
  if (!artistDoc) throw new ApiError(400, "A valid artist is required")

  let coverUrl = ""
  let coverKey = ""
  if (req.file) {
    const saved = await storage.save({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      folder: "albums",
    })
    coverUrl = saved.url
    coverKey = saved.key
  }

  const album = await Album.create({
    title,
    artist: artistDoc._id,
    releaseYear: releaseYear ? Number(releaseYear) : null,
    coverUrl,
    coverKey,
  })
  res.status(201).json({ success: true, data: album })
})

export const updateAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id)
  if (!album) throw new ApiError(404, "Album not found")

  const { title, artist, releaseYear } = req.body
  if (title !== undefined) album.title = title
  if (releaseYear !== undefined) album.releaseYear = releaseYear ? Number(releaseYear) : null
  if (artist) {
    const artistDoc = await Artist.findById(artist)
    if (!artistDoc) throw new ApiError(400, "A valid artist is required")
    album.artist = artistDoc._id
  }
  if (req.file) {
    if (album.coverKey) await storage.remove(album.coverKey)
    const saved = await storage.save({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      folder: "albums",
    })
    album.coverUrl = saved.url
    album.coverKey = saved.key
  }
  await album.save()
  res.json({ success: true, data: album })
})

export const deleteAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id)
  if (!album) throw new ApiError(404, "Album not found")

  if (album.coverKey) await storage.remove(album.coverKey)
  // Detach songs from the album rather than deleting them.
  await Song.updateMany({ album: album._id }, { $set: { album: null } })
  await album.deleteOne()
  res.json({ success: true, message: "Album deleted" })
})
