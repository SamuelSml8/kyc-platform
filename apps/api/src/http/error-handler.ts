import type { Hono } from 'hono'
import { ValidationError } from '../domain/validation'
import { fail } from './response'

/** Manejo centralizado de errores de dominio y 500. */
export function applyErrorHandler(app: Hono<any>) {
  app.onError((err, c) => {
    if (err instanceof ValidationError) {
      return fail(c, err.message, err.statusCode as 400 | 413)
    }
    console.error('Unhandled error:', err.message)
    return fail(c, 'Internal server error.', 500)
  })
}
