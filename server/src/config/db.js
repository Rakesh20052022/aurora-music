import mongoose from "mongoose"
import { env } from "./env.js"

export async function connectDB() {
  mongoose.set("strictQuery", true)
  try {
    const conn = await mongoose.connect(env.mongoUri)
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error("[db] MongoDB connection error:", error.message)
    process.exit(1)
  }
}
