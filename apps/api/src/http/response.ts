import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export interface ApiResponse<T> {
  ok: boolean
  message: string
  data: T | null
}

export function success<T>(
  c: Context,
  data: T,
  message: string,
  status: ContentfulStatusCode = 200,
) {
  const body: ApiResponse<T> = { ok: true, message, data }
  return c.json(body, status)
}

export function fail(
  c: Context,
  message: string,
  status: ContentfulStatusCode = 400,
) {
  const body: ApiResponse<null> = { ok: false, message, data: null }
  return c.json(body, status)
}
