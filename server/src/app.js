import express from "express"
import cors from "cors"
import morgan from "morgan"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { env, isProd } from "./config/env.js"
import { notFound, errorHandler } from "./middleware/error.js"

import authRoutes from "./routes/authRoutes.js"
import songRoutes from "./routes/songRoutes.js"
import playlistRoutes from "./routes/playlistRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import artistRoutes from "./routes/artistRoutes.js"
import albumRoutes from "./routes/albumRoutes.js"
import searchRoutes from "./routes/searchRoutes.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.clientUrl, credentials: true }))
  app.use(express.json({ limit: "1mb" }))
  app.use(express.urlencoded({ extended: true }))
  if (!isProd) app.use(morgan("dev"))

  // Serve locally-stored uploads when STORAGE_PROVIDER=local.
  app.use(
    "/uploads",
    express.static(path.resolve(__dirname, "../uploads"), {
      maxAge: "7d",
      setHeaders: (res) => res.set("Access-Control-Allow-Origin", "*"),
    }),
  )

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, status: "ok", storage: env.storageProvider })
  })

  app.use("/api/auth", authRoutes)
  app.use("/api/songs", songRoutes)
  app.use("/api/playlists", playlistRoutes)
  app.use("/api/users", userRoutes)
  app.use("/api/artists", artistRoutes)
  app.use("/api/albums", albumRoutes)
  app.use("/api/search", searchRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
