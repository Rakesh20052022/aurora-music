import { createApp } from "./app.js"
import { connectDB } from "./config/db.js"
import { env } from "./config/env.js"

async function start() {
  await connectDB()
  const app = createApp()
  app.listen(env.port, () => {
    console.log(`[server] Aurora API listening on ${env.serverUrl} (${env.nodeEnv})`)
    console.log(`[server] Storage provider: ${env.storageProvider}`)
  })
}

start()
