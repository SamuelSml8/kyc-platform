import type { Context } from 'hono'
import { fail } from '../http/response'
import type { ImageStorage } from '../storage/types'

/** Extrae la key R2 desde una ruta /files/... */
export function fileKeyFromPath(path: string): string {
  return decodeURIComponent(path.replace(/^\/files\/?/, ''))
}

export async function handleFileRequest(c: Context, images: ImageStorage) {
  const key = fileKeyFromPath(c.req.path)
  if (!key || key.includes('..')) {
    return fail(c, 'Invalid file key.', 400)
  }

  const object = await images.get(key)
  if (!object) {
    return fail(c, 'File not found.', 404)
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
