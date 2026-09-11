/**
 * Seed script: creates an admin user, a few artists/albums/songs.
 * Audio URLs point at royalty-free sample files so the player works out of the box.
 *
 * Run with:  npm run seed
 */
import mongoose from "mongoose"
import { connectDB } from "../config/db.js"
import { env } from "../config/env.js"
import { User } from "../models/User.js"
import { Artist } from "../models/Artist.js"
import { Album } from "../models/Album.js"
import { Song } from "../models/Song.js"

const SAMPLE_AUDIO = [
  "https://cdn.pixabay.com/audio/2022/03/15/audio_1b2b2d1f7f.mp3",
  "https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3",
  "https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1bab.mp3",
]

async function run() {
  await connectDB()
  console.log("[seed] Clearing existing catalog...")
  await Promise.all([Artist.deleteMany({}), Album.deleteMany({}), Song.deleteMany({})])

  const adminEmail = env.adminEmail || "admin@aurora.local"
  let admin = await User.findOne({ email: adminEmail })
  if (!admin) {
    admin = await User.create({
      name: "Aurora Admin",
      email: adminEmail,
      password: "password123",
      role: "admin",
    })
    console.log(`[seed] Created admin: ${adminEmail} / password123`)
  } else {
    admin.role = "admin"
    await admin.save()
    console.log(`[seed] Existing user promoted to admin: ${adminEmail}`)
  }

  const artists = await Artist.create([
    { name: "Nova Skies", bio: "Ambient electronic project exploring wide, cinematic textures." },
    { name: "The Vale", bio: "Indie folk trio with warm harmonies." },
    { name: "Pulse Theory", bio: "Late-night synthwave and driving beats." },
  ])

  const albums = await Album.create([
    { title: "Aurora", artist: artists[0]._id, releaseYear: 2023 },
    { title: "Hollow Pines", artist: artists[1]._id, releaseYear: 2022 },
    { title: "Neon Circuit", artist: artists[2]._id, releaseYear: 2024 },
  ])

  const songsData = [
    { title: "Northern Lights", artist: 0, album: 0, genre: "Ambient", duration: 212 },
    { title: "Glacier", artist: 0, album: 0, genre: "Ambient", duration: 188 },
    { title: "Cabin Song", artist: 1, album: 1, genre: "Folk", duration: 201 },
    { title: "River Bend", artist: 1, album: 1, genre: "Folk", duration: 176 },
    { title: "Midnight Drive", artist: 2, album: 2, genre: "Synthwave", duration: 240 },
    { title: "Circuit Breaker", artist: 2, album: 2, genre: "Synthwave", duration: 222 },
  ]

  for (const [i, s] of songsData.entries()) {
    const song = await Song.create({
      title: s.title,
      artist: artists[s.artist]._id,
      album: albums[s.album]._id,
      genre: s.genre,
      duration: s.duration,
      year: 2023,
      audioUrl: SAMPLE_AUDIO[i % SAMPLE_AUDIO.length],
      coverUrl: "",
      playCount: Math.floor(Math.random() * 500),
      likeCount: Math.floor(Math.random() * 200),
    })
    albums[s.album].songs.addToSet(song._id)
  }
  await Promise.all(albums.map((a) => a.save()))

  console.log("[seed] Seeded 3 artists, 3 albums, 6 songs.")
  await mongoose.connection.close()
  console.log("[seed] Done.")
  process.exit(0)
}

run().catch((err) => {
  console.error("[seed] Failed:", err)
  process.exit(1)
})
