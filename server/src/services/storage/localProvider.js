import fs from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"
import { fileURLToPath } from "node:url"
import { env } from "../../config/env.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// server/uploads at the project root of the server package
const UPLOAD_ROOT = path.resolve(__dirname, "../../../uploads")

function safeName(originalName) {
  const ext = path.extname(originalName)
  const base = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
  const hash = crypto.randomBytes(6).toString("hex")
  return `${base || "file"}-${hash}${ext}`
}

export const localStorageProvider = {
  async save({ buffer, originalName, folder = "misc" }) {
    const dir = path.join(UPLOAD_ROOT, folder)
    await fs.mkdir(dir, { recursive: true })
    const filename = safeName(originalName)
    const key = `${folder}/${filename}`
    await fs.writeFile(path.join(UPLOAD_ROOT, key), buffer)
    return {
      key,
      url: `${env.serverUrl}/uploads/${key}`,
    }
  },

  async remove(key) {
    if (!key) return
    // Only remove keys inside the upload root; ignore full external URLs.
    const target = path.join(UPLOAD_ROOT, key)
    try {
      await fs.unlink(target)
    } catch (err) {
      if (err.code !== "ENOENT") throw err
    }
  },
}

export { UPLOAD_ROOT }
