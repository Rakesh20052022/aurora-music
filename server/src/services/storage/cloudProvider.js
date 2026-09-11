import crypto from "node:crypto"
import path from "node:path"
import { env } from "../../config/env.js"

/**
 * Cloud storage provider (S3-compatible) — production stub.
 *
 * This intentionally ships without the AWS SDK bundled so the app installs
 * and runs with zero cloud config in development. To enable it in production:
 *
 *   1. npm install @aws-sdk/client-s3
 *   2. Set STORAGE_PROVIDER=cloud and the CLOUD_* env vars in .env
 *   3. Uncomment the S3 implementation below.
 *
 * The public interface (save/remove) matches localProvider so nothing else
 * in the codebase changes when you switch providers.
 */
function keyFor(originalName, folder) {
  const ext = path.extname(originalName)
  const hash = crypto.randomBytes(12).toString("hex")
  return `${folder}/${Date.now()}-${hash}${ext}`
}

export const cloudStorageProvider = {
  async save({ buffer, originalName, mimetype, folder = "misc" }) {
    if (!env.cloud.bucket) {
      throw new Error(
        "STORAGE_PROVIDER=cloud but CLOUD_BUCKET is not configured. See server/src/services/storage/cloudProvider.js",
      )
    }
    const key = keyFor(originalName, folder)

    // --- Enable in production (after `npm install @aws-sdk/client-s3`) ---
    //
    // const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
    // const s3 = new S3Client({
    //   region: env.cloud.region,
    //   credentials: {
    //     accessKeyId: env.cloud.accessKeyId,
    //     secretAccessKey: env.cloud.secretAccessKey,
    //   },
    // })
    // await s3.send(new PutObjectCommand({
    //   Bucket: env.cloud.bucket,
    //   Key: key,
    //   Body: buffer,
    //   ContentType: mimetype,
    // }))

    void buffer
    void mimetype

    const base = env.cloud.publicBaseUrl || `https://${env.cloud.bucket}.s3.${env.cloud.region}.amazonaws.com`
    return { key, url: `${base}/${key}` }
  },

  async remove(key) {
    if (!key || !env.cloud.bucket) return
    // const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3")
    // const s3 = new S3Client({ region: env.cloud.region, credentials: { ... } })
    // await s3.send(new DeleteObjectCommand({ Bucket: env.cloud.bucket, Key: key }))
  },
}
