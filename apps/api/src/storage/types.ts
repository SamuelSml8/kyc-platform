export interface StoredObject {
  body: ReadableStream | ArrayBuffer
  contentType: string
}

export interface ImageStorage {
  put(key: string, data: ArrayBuffer, contentType: string): Promise<void>
  get(key: string): Promise<StoredObject | null>
}
