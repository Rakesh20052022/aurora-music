import { User } from "../models/User.js"
import { Song } from "../models/Song.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"

const SONG_POPULATE = [
  { path: "artist", select: "name image" },
  { path: "album", select: "title coverUrl" },
]

// GET /api/users/me/liked
export const getLikedSongs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "likedSongs",
    populate: SONG_POPULATE,
  })
  const combined = [...user.likedSongs, ...(user.likedAudiusSongs || [])]
  res.json({ success: true, data: combined })
})

// POST /api/users/me/liked/:songId
export const likeSong = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const songId = req.params.songId

  if (req.body && req.body.isAudius) {
    const already = (user.likedAudiusSongs || []).some((s) => String(s._id) === String(songId))
    if (!already) {
      if (!user.likedAudiusSongs) user.likedAudiusSongs = []
      user.likedAudiusSongs.push(req.body)
      await user.save()
    }
    return res.json({ success: true, data: { liked: true, songId } })
  }

  const song = await Song.findById(songId)
  if (!song) throw new ApiError(404, "Song not found")

  const already = user.likedSongs.some((id) => String(id) === String(song._id))
  if (!already) {
    user.likedSongs.push(song._id)
    await user.save()
    await Song.findByIdAndUpdate(song._id, { $inc: { likeCount: 1 } })
  }
  res.json({ success: true, data: { liked: true, songId: song._id } })
})

// DELETE /api/users/me/liked/:songId
export const unlikeSong = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const songId = req.params.songId

  const audiusIdx = (user.likedAudiusSongs || []).findIndex((s) => String(s._id) === String(songId))
  if (audiusIdx !== -1) {
    user.likedAudiusSongs.splice(audiusIdx, 1)
    await user.save()
    return res.json({ success: true, data: { liked: false, songId } })
  }

  const had = user.likedSongs.some((id) => String(id) === String(songId))
  if (had) {
    user.likedSongs.pull(songId)
    await user.save()
    await Song.findByIdAndUpdate(songId, { $inc: { likeCount: -1 } })
  }
  res.json({ success: true, data: { liked: false, songId } })
})

// GET /api/users/me/recent
export const getRecentlyPlayed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "recentlyPlayed.song",
    populate: SONG_POPULATE,
  })
  const items = user.recentlyPlayed
    .filter((entry) => entry.song || entry.audiusSong)
    .map((entry) => {
      if (entry.audiusSong) return { ...entry.audiusSong, playedAt: entry.playedAt }
      return { ...entry.song.toObject(), playedAt: entry.playedAt }
    })
  res.json({ success: true, data: items })
})

// POST /api/users/me/recent/:songId
export const pushRecentlyPlayed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const songId = req.params.songId

  if (req.body && req.body.isAudius) {
    user.recentlyPlayed = user.recentlyPlayed.filter((e) => String(e.audiusSong?._id) !== String(songId))
    user.recentlyPlayed.unshift({ audiusSong: req.body, playedAt: new Date() })
    user.recentlyPlayed = user.recentlyPlayed.slice(0, 50)
    await user.save()
    return res.json({ success: true, message: "Recorded" })
  }

  const song = await Song.findById(songId)
  if (!song) throw new ApiError(404, "Song not found")

  // Remove any existing entry for this song, then unshift to the front.
  user.recentlyPlayed = user.recentlyPlayed.filter((e) => e.song && String(e.song) !== String(song._id))
  user.recentlyPlayed.unshift({ song: song._id, playedAt: new Date() })
  user.recentlyPlayed = user.recentlyPlayed.slice(0, 50)
  await user.save()

  res.json({ success: true, message: "Recorded" })
})

// PUT /api/users/me/preferences
export const updatePreferences = asyncHandler(async (req, res) => {
  const { volume, muted, shuffle, repeat } = req.body
  const user = await User.findById(req.user._id)

  if (volume !== undefined) user.preferences.volume = Math.min(1, Math.max(0, Number(volume)))
  if (muted !== undefined) user.preferences.muted = Boolean(muted)
  if (shuffle !== undefined) user.preferences.shuffle = Boolean(shuffle)
  if (repeat !== undefined) user.preferences.repeat = repeat

  await user.save()
  res.json({ success: true, data: user.preferences })
})

// PUT /api/users/me
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body
  const user = await User.findById(req.user._id)
  if (name !== undefined) user.name = name
  await user.save()
  res.json({ success: true, user: user.toSafeJSON() })
})
