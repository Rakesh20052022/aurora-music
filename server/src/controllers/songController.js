import mongoose from "mongoose"
import { Song } from "../models/Song.js"
import { Album } from "../models/Album.js"
import { Artist } from "../models/Artist.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { storage } from "../services/storage/index.js"

const POPULATE = [
  { path: "artist", select: "name image" },
  { path: "album", select: "title coverUrl" },
]

// GET /api/songs?page=&limit=&sort=
export const listSongs = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
  const skip = (page - 1) * limit

  const sortMap = {
    newest: { createdAt: -1 },
    trending: { playCount: -1, likeCount: -1 },
    popular: { likeCount: -1 },
    title: { title: 1 },
  }
  const sort = sortMap[req.query.sort] || sortMap.newest

  const [items, total] = await Promise.all([
    Song.find().populate(POPULATE).sort(sort).skip(skip).limit(limit).lean(),
    Song.estimatedDocumentCount(),
  ])

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

export const getSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id).populate(POPULATE).lean()
  if (!song) throw new ApiError(404, "Song not found")
  res.json({ success: true, data: song })
})

// POST /api/songs  (admin, multipart)
export const createSong = asyncHandler(async (req, res) => {
  const { title, artist, album, genre, year, duration, lyrics } = req.body

  if (!req.files?.audio?.[0]) throw new ApiError(400, "An audio file is required")

  const artistDoc = await resolveArtist(artist)
  const albumDoc = album ? await Album.findById(album) : null

  const audio = await storage.save({
    buffer: req.files.audio[0].buffer,
    originalName: req.files.audio[0].originalname,
    mimetype: req.files.audio[0].mimetype,
    folder: "audio",
  })

  let cover = { url: albumDoc?.coverUrl || "", key: "" }
  if (req.files?.cover?.[0]) {
    cover = await storage.save({
      buffer: req.files.cover[0].buffer,
      originalName: req.files.cover[0].originalname,
      mimetype: req.files.cover[0].mimetype,
      folder: "covers",
    })
  }

  const song = await Song.create({
    title,
    artist: artistDoc._id,
    album: albumDoc?._id || null,
    genre: genre || "",
    year: year ? Number(year) : null,
    duration: duration ? Number(duration) : 0,
    lyrics: lyrics || "",
    audioUrl: audio.url,
    audioKey: audio.key,
    coverUrl: cover.url,
    coverKey: cover.key,
  })

  if (albumDoc) {
    albumDoc.songs.addToSet(song._id)
    await albumDoc.save()
  }

  const populated = await song.populate(POPULATE)
  res.status(201).json({ success: true, data: populated })
})

// PUT /api/songs/:id  (admin, multipart optional)
export const updateSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id)
  if (!song) throw new ApiError(404, "Song not found")

  const { title, artist, album, genre, year, duration, lyrics } = req.body

  if (title !== undefined) song.title = title
  if (genre !== undefined) song.genre = genre
  if (year !== undefined) song.year = year ? Number(year) : null
  if (duration !== undefined) song.duration = duration ? Number(duration) : song.duration
  if (lyrics !== undefined) song.lyrics = lyrics
  if (artist) song.artist = (await resolveArtist(artist))._id
  if (album !== undefined) song.album = album || null

  if (req.files?.audio?.[0]) {
    const audio = await storage.save({
      buffer: req.files.audio[0].buffer,
      originalName: req.files.audio[0].originalname,
      mimetype: req.files.audio[0].mimetype,
      folder: "audio",
    })
    song.audioUrl = audio.url
    song.audioKey = audio.key
  }
  if (req.files?.cover?.[0]) {
    const cover = await storage.save({
      buffer: req.files.cover[0].buffer,
      originalName: req.files.cover[0].originalname,
      mimetype: req.files.cover[0].mimetype,
      folder: "covers",
    })
    song.coverUrl = cover.url
    song.coverKey = cover.key
  }

  await song.save()
  const populated = await song.populate(POPULATE)
  res.json({ success: true, data: populated })
})

export const deleteSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id)
  if (!song) throw new ApiError(404, "Song not found")

  await Promise.all([storage.remove(song.audioKey), storage.remove(song.coverKey)])
  await Album.updateMany({ songs: song._id }, { $pull: { songs: song._id } })
  await song.deleteOne()

  res.json({ success: true, message: "Song deleted" })
})

// POST /api/songs/:id/play  — increments play count (fire-and-forget from client)
export const registerPlay = asyncHandler(async (req, res) => {
  const song = await Song.findByIdAndUpdate(
    req.params.id,
    { $inc: { playCount: 1 } },
    { new: true },
  ).lean()
  if (!song) throw new ApiError(404, "Song not found")
  res.json({ success: true, data: { playCount: song.playCount } })
})

async function resolveArtist(artistInput) {
  if (!artistInput) throw new ApiError(400, "Artist is required")
  if (mongoose.isValidObjectId(artistInput)) {
    const found = await Artist.findById(artistInput)
    if (found) return found
  }
  // Treat as a name; create the artist if it does not exist yet.
  const name = String(artistInput).trim()
  const existing = await Artist.findOne({ name })
  if (existing) return existing
  return Artist.create({ name })
}
