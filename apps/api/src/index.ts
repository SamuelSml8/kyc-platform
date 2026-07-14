import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { applyErrorHandler } from './http/error-handler'
import { success } from './http/response'
import { handleFileRequest } from './routes/files'
import { createVerificationRoutes } from './routes/verification'
import { VerificationService } from './services/verification-service'
import { R2ImageStorage } from './storage/r2-storage'
import { D1VerificationStore } from './store/d1-store'

export type Env = {
  DB: D1Database
  IMAGES: R2Bucket
  CORS_ORIGIN: string
}

function parseAllowedOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function createApp(env: Env) {
  const app = new Hono<{ Bindings: Env }>()
  const images = new R2ImageStorage(env.IMAGES)
  const service = new VerificationService(
    new D1VerificationStore(env.DB),
    images,
  )
  const allowedOrigins = parseAllowedOrigins(env.CORS_ORIGIN)

  app.use(
    '*',
    cors({
      origin: (origin) => {
        if (!origin) return allowedOrigins[0] ?? '*'
        return allowedOrigins.includes(origin) ? origin : ''
      },
      allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
      maxAge: 86400,
    }),
  )

  applyErrorHandler(app)

  app.get('/health', (c) =>
    success(c, { status: 'up' }, 'Service is healthy.'),
  )

  app.route('/verification', createVerificationRoutes(service))
  app.get('/files/*', (c) => handleFileRequest(c, images))

  return app
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return createApp(env).fetch(request, env, ctx)
  },
}
