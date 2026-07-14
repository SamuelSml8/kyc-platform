import type { ImageStorage, StoredObject } from './types'

export class R2ImageStorage implements ImageStorage {
  constructor(private readonly bucket: R2Bucket) {}

  async put(key: string, data: ArrayBuffer, contentType: string): Promise<void> {
    await this.bucket.put(key, data, {
      httpMetadata: { contentType },
    })
  }

  async get(key: string): Promise<StoredObject | null> {
    const object = await this.bucket.get(key)
    if (!object) return null

    return {
      body: object.body,
      contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
    }
  }
}
