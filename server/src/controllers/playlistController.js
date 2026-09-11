import { Playlist } from "../models/Playlist.js"
import { User } from "../models/User.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { storage } from "../services/storage/index.js"

const SONG_POPULATE = {
  path: "songs",
  populate: [
    { path: "artist", select: "name image" },
    { path: "album", select: "title coverUrl" },
  ],
}

function ensureOwner(playlist, userId) {
  if (!playlist) throw new ApiError(404, "Playlist not found")
  if (String(playlist.owner) !== String(userId)) {
    throw new ApiError(403, "You do not own this playlist")
  }
}

// GET /api/playlists  — current user's playlists
export const listMyPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user._id }).sort({ updatedAt: -1 }).lean()
  res.json({ success: true, data: playlists })
})

export const getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id).populate(SONG_POPULATE).lean()
  if (!playlist) throw new ApiError(404, "Playlist not found")
  res.json({ success: true, data: playlist })
})

export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  let coverUrl = ""
  let coverKey = ""
  if (req.file) {
    const saved = await storage.save({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      folder: "playlists",
    })
    coverUrl = saved.url
    coverKey = saved.key
  }

  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user._id,
    coverUrl,
    coverKey,
  })

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { playlists: playlist._id } })
  res.status(201).json({ success: true, data: playlist })
})

export const updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
  ensureOwner(playlist, req.user._id)

  const { name, description } = req.body
  if (name !== undefined) playlist.name = name
  if (description !== undefined) playlist.description = description

  if (req.file) {
    if (playlist.coverKey) await storage.remove(playlist.coverKey)
    const saved = await storage.save({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      folder: "playlists",
    })
    playlist.coverUrl = saved.url
    playlist.coverKey = saved.key
  }

  await playlist.save()
  res.json({ success: true, data: playlist })
})

export const deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
  ensureOwner(playlist, req.user._id)

  if (playlist.coverKey) await storage.remove(playlist.coverKey)
  await playlist.deleteOne()
  await User.findByIdAndUpdate(req.user._id, { $pull: { playlists: playlist._id } })

  res.json({ success: true, message: "Playlist deleted" })
})

// POST /api/playlists/:id/songs  { songId }
export const addSong = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
  ensureOwner(playlist, req.user._id)

  playlist.songs.addToSet(req.body.songId)
  await playlist.save()
  const populated = await playlist.populate(SONG_POPULATE)
  res.json({ success: true, data: populated })
})

// DELETE /api/playlists/:id/songs/:songId
export const removeSong = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
  ensureOwner(playlist, req.user._id)

  playlist.songs.pull(req.params.songId)
  await playlist.save()
  const populated = await playlist.populate(SONG_POPULATE)
  res.json({ success: true, data: populated })
})
