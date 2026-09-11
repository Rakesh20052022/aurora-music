import { Song } from "../models/Song.js"
import { Artist } from "../models/Artist.js"
import { Album } from "../models/Album.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const SONG_POPULATE = [
  { path: "artist", select: "name image" },
  { path: "album", select: "title coverUrl" },
]

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// GET /api/search?q=&type=all|songs|artists|albums
export const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim()
  const type = req.query.type || "all"

  if (!q) {
    return res.json({ success: true, data: { songs: [], artists: [], albums: [] } })
  }

  const rx = new RegExp(escapeRegex(q), "i")
  const wantSongs = type === "all" || type === "songs"
  const wantArtists = type === "all" || type === "artists"
  const wantAlbums = type === "all" || type === "albums"

  // Match artists first so we can also surface their songs.
  const matchingArtists = wantSongs || wantArtists ? await Artist.find({ name: rx }).lean() : []
  const artistIds = matchingArtists.map((a) => a._id)

  const [songs, artists, albums] = await Promise.all([
    wantSongs
      ? Song.find({ $or: [{ title: rx }, { genre: rx }, { artist: { $in: artistIds } }] })
          .populate(SONG_POPULATE)
          .limit(50)
          .lean()
      : [],
    wantArtists ? Artist.find({ name: rx }).limit(20).lean() : [],
    wantAlbums
      ? Album.find({ $or: [{ title: rx }, { artist: { $in: artistIds } }] })
          .populate({ path: "artist", select: "name image" })
          .limit(20)
          .lean()
      : [],
  ])

  res.json({ success: true, data: { songs, artists, albums } })
})
