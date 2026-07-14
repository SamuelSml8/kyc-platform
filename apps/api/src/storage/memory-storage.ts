import type { ImageStorage, StoredObject } from './types'

/** Storage en memoria para tests. */
export class MemoryImageStorage implements ImageStorage {
  private readonly objects = new Map<
    string,
    { data: ArrayBuffer; contentType: string }
  >()

  async put(key: string, data: ArrayBuffer, contentType: string): Promise<void> {
    this.objects.set(key, { data, contentType })
  }

  async get(key: string): Promise<StoredObject | null> {
    const object = this.objects.get(key)
    if (!object) return null
    return { body: object.data, contentType: object.contentType }
  }
}
