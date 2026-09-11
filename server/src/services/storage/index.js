import { env } from "../../config/env.js"
import { localStorageProvider } from "./localProvider.js"
import { cloudStorageProvider } from "./cloudProvider.js"

/**
 * Storage abstraction.
 *
 * A provider implements:
 *   save({ buffer, originalName, mimetype, folder }) -> { url, key }
 *   remove(key) -> Promise<void>
 *
 * Switch providers with the STORAGE_PROVIDER env var ("local" | "cloud").
 * Application code never hardcodes URLs; it always asks the provider.
 */
const providers = {
  local: localStorageProvider,
  cloud: cloudStorageProvider,
}

const provider = providers[env.storageProvider] || localStorageProvider

export const storage = {
  save: (file) => provider.save(file),
  remove: (key) => provider.remove(key),
  name: env.storageProvider,
}
