import dotenv from "dotenv"

dotenv.config()

function required(name, fallback) {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  serverUrl: process.env.SERVER_URL || "http://localhost:5000",
  mongoUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/aurora-music"),
  jwtSecret: required("JWT_SECRET", "dev-insecure-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  storageProvider: process.env.STORAGE_PROVIDER || "local",
  adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase(),
  cloud: {
    bucket: process.env.CLOUD_BUCKET || "",
    region: process.env.CLOUD_REGION || "",
    accessKeyId: process.env.CLOUD_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY || "",
    publicBaseUrl: process.env.CLOUD_PUBLIC_BASE_URL || "",
  },
}

export const isProd = env.nodeEnv === "production"
