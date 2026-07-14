import { Hono } from 'hono'
import { toPublicVerification } from '../domain/map-verification'
import {
  parseCreateFields,
  parseImageFile,
  parseUpdateStatusBody,
} from '../domain/validation'
import { fail, success } from '../http/response'
import type { VerificationService } from '../services/verification-service'

function publicBaseUrl(c: { req: { url: string } }): string {
  return new URL(c.req.url).origin
}

export function createVerificationRoutes(service: VerificationService) {
  const routes = new Hono()

  routes.post('/', async (c) => {
    let body: Record<string, unknown>
    try {
      body = (await c.req.parseBody()) as Record<string, unknown>
    } catch {
      return fail(c, 'Invalid multipart form data.', 400)
    }

    const fields = parseCreateFields({
      name: body.name,
      email: body.email,
      documentNumber: body.documentNumber,
    })
    const selfie = await parseImageFile(body.selfie, 'selfie')
    const documentImage = await parseImageFile(body.documentImage, 'documentImage')

    const record = await service.create(fields, selfie, documentImage)
    return success(
      c,
      toPublicVerification(record, publicBaseUrl(c)),
      'Verification created.',
      201,
    )
  })

  routes.get('/:id', async (c) => {
    const record = await service.findById(c.req.param('id'))
    if (!record) {
      return fail(c, 'Verification not found.', 404)
    }
    return success(
      c,
      toPublicVerification(record, publicBaseUrl(c)),
      'Verification retrieved.',
    )
  })

  routes.patch('/:id', async (c) => {
    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return fail(c, 'Invalid JSON body.', 400)
    }

    const { status } = parseUpdateStatusBody(body)
    const updated = await service.updateStatus(c.req.param('id'), status)
    if (!updated) {
      return fail(c, 'Verification not found.', 404)
    }
    return success(
      c,
      toPublicVerification(updated, publicBaseUrl(c)),
      'Verification status updated.',
    )
  })

  return routes
}
