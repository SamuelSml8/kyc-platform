import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import type { Verification } from '../src/domain/types'
import { applyErrorHandler } from '../src/http/error-handler'
import type { ApiResponse } from '../src/http/response'
import { fileKeyFromPath, handleFileRequest } from '../src/routes/files'
import { createVerificationRoutes } from '../src/routes/verification'
import { VerificationService } from '../src/services/verification-service'
import { MemoryImageStorage } from '../src/storage/memory-storage'
import { MemoryVerificationStore } from '../src/store/memory-store'

const tinyPngBytes = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  ),
  (c) => c.charCodeAt(0),
)

function buildTestApp() {
  const images = new MemoryImageStorage()
  const service = new VerificationService(
    new MemoryVerificationStore(),
    images,
  )
  const app = new Hono()
  applyErrorHandler(app)
  app.route('/verification', createVerificationRoutes(service))
  app.get('/files/*', (c) => handleFileRequest(c, images))
  return app
}

function formPayload() {
  const form = new FormData()
  form.set('name', 'Juan')
  form.set('email', 'juan@test.com')
  form.set('documentNumber', '123')
  form.set(
    'selfie',
    new File([tinyPngBytes], 'selfie.png', { type: 'image/png' }),
  )
  form.set(
    'documentImage',
    new File([tinyPngBytes], 'doc.png', { type: 'image/png' }),
  )
  return form
}

describe('fileKeyFromPath', () => {
  it('extrae la key desde /files/...', () => {
    expect(fileKeyFromPath('/files/verifications/abc/selfie.png')).toBe(
      'verifications/abc/selfie.png',
    )
  })
})

describe('verification routes (multipart + R2 keys)', () => {
  it('POST crea verificación en pending con URLs de archivos', async () => {
    const app = buildTestApp()
    const res = await app.request('http://localhost/verification', {
      method: 'POST',
      body: formPayload(),
    })

    expect(res.status).toBe(201)
    const body = (await res.json()) as ApiResponse<Verification>
    expect(body.ok).toBe(true)
    expect(body.data?.status).toBe('pending')
    expect(body.data?.selfie).toMatch(/^http:\/\/localhost\/files\/verifications\//)
    expect(body.data?.documentImage).toMatch(
      /^http:\/\/localhost\/files\/verifications\//,
    )
  })

  it('GET retorna 404 si no existe', async () => {
    const app = buildTestApp()
    const res = await app.request(
      'http://localhost/verification/00000000-0000-4000-8000-000000000000',
    )
    expect(res.status).toBe(404)
    const body = (await res.json()) as ApiResponse<null>
    expect(body.ok).toBe(false)
  })

  it('GET archivos sirve la imagen subida', async () => {
    const app = buildTestApp()
    const created = await app.request('http://localhost/verification', {
      method: 'POST',
      body: formPayload(),
    })
    const createdBody = (await created.json()) as ApiResponse<Verification>
    const fileRes = await app.request(createdBody.data!.selfie)
    expect(fileRes.status).toBe(200)
    expect(fileRes.headers.get('Content-Type')).toBe('image/png')
  })

  it('PATCH actualiza a approved', async () => {
    const app = buildTestApp()
    const created = await app.request('http://localhost/verification', {
      method: 'POST',
      body: formPayload(),
    })
    const id = ((await created.json()) as ApiResponse<Verification>).data!.id

    const res = await app.request(`http://localhost/verification/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as ApiResponse<Verification>
    expect(body.data?.status).toBe('approved')
  })

  it('POST inválido retorna 400', async () => {
    const app = buildTestApp()
    const form = new FormData()
    form.set('name', 'Juan')
    const res = await app.request('http://localhost/verification', {
      method: 'POST',
      body: form,
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as ApiResponse<null>
    expect(body.ok).toBe(false)
  })
})
