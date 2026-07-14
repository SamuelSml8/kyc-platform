import { describe, expect, it } from 'vitest'
import {
  parseCreateFields,
  parseImageFile,
  parseUpdateStatusBody,
  ValidationError,
} from '../src/domain/validation'

const tinyPngBytes = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  ),
  (c) => c.charCodeAt(0),
)

describe('parseCreateFields', () => {
  it('acepta campos válidos', () => {
    const result = parseCreateFields({
      name: ' Juan ',
      email: 'Juan@Test.com',
      documentNumber: '123',
    })

    expect(result.name).toBe('Juan')
    expect(result.email).toBe('juan@test.com')
    expect(result.documentNumber).toBe('123')
  })

  it('rechaza email inválido', () => {
    expect(() =>
      parseCreateFields({
        name: 'Juan',
        email: 'no-es-email',
        documentNumber: '123',
      }),
    ).toThrow(ValidationError)
  })
})

describe('parseImageFile', () => {
  it('acepta un Blob de imagen', async () => {
    const file = new File([tinyPngBytes], 'selfie.png', { type: 'image/png' })
    const parsed = await parseImageFile(file, 'selfie')
    expect(parsed.contentType).toBe('image/png')
    expect(parsed.extension).toBe('png')
    expect(parsed.data.byteLength).toBeGreaterThan(0)
  })

  it('rechaza tipos no permitidos', async () => {
    const file = new File([tinyPngBytes], 'doc.pdf', { type: 'application/pdf' })
    await expect(parseImageFile(file, 'selfie')).rejects.toThrow(/JPEG, PNG, or WebP/)
  })
})

describe('parseUpdateStatusBody', () => {
  it('acepta approved y rejected', () => {
    expect(parseUpdateStatusBody({ status: 'approved' }).status).toBe('approved')
    expect(parseUpdateStatusBody({ status: 'rejected' }).status).toBe('rejected')
  })

  it('rechaza pending u otros valores', () => {
    expect(() => parseUpdateStatusBody({ status: 'pending' })).toThrow(ValidationError)
    expect(() => parseUpdateStatusBody({ status: 'foo' })).toThrow(ValidationError)
  })
})
