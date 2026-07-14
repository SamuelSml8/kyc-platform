import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  REVIEW_STATUSES,
  type AllowedImageType,
  type VerificationStatus,
} from './types'

export class ValidationError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'ValidationError'
    this.statusCode = statusCode
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface ParsedImageFile {
  data: ArrayBuffer
  contentType: AllowedImageType
  extension: 'jpg' | 'png' | 'webp'
}

export interface ParsedCreateFields {
  name: string
  email: string
  documentNumber: string
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`Field "${field}" is required and must be a string.`)
  }
  const trimmed = value.trim()
  if (!trimmed) {
    throw new ValidationError(`Field "${field}" cannot be empty.`)
  }
  return trimmed
}

function extensionFor(contentType: AllowedImageType): ParsedImageFile['extension'] {
  if (contentType === 'image/png') return 'png'
  if (contentType === 'image/webp') return 'webp'
  return 'jpg'
}

function normalizeContentType(type: string): AllowedImageType | null {
  const lower = type.toLowerCase().split(';')[0]?.trim() ?? ''
  const normalized = lower === 'image/jpg' ? 'image/jpeg' : lower
  if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(normalized)) {
    return normalized as AllowedImageType
  }
  return null
}

export function parseCreateFields(fields: {
  name: unknown
  email: unknown
  documentNumber: unknown
}): ParsedCreateFields {
  const name = requireNonEmptyString(fields.name, 'name')
  const email = requireNonEmptyString(fields.email, 'email').toLowerCase()
  if (!EMAIL_RE.test(email)) {
    throw new ValidationError('Invalid email format.')
  }
  return {
    name,
    email,
    documentNumber: requireNonEmptyString(fields.documentNumber, 'documentNumber'),
  }
}

export async function parseImageFile(
  value: unknown,
  field: string,
): Promise<ParsedImageFile> {
  if (value == null) {
    throw new ValidationError(`Field "${field}" is required.`)
  }

  if (typeof value !== 'object' || !('arrayBuffer' in value)) {
    throw new ValidationError(`Field "${field}" must be an image file.`)
  }

  const blob = value as Blob
  const contentType = normalizeContentType(blob.type || '')
  if (!contentType) {
    throw new ValidationError(
      `Field "${field}" must be a JPEG, PNG, or WebP image.`,
    )
  }

  const data = await blob.arrayBuffer()
  if (data.byteLength > MAX_IMAGE_BYTES) {
    throw new ValidationError(
      `Field "${field}" exceeds the ${MAX_IMAGE_BYTES} byte limit.`,
      413,
    )
  }

  return {
    data,
    contentType,
    extension: extensionFor(contentType),
  }
}

export function parseUpdateStatusBody(body: unknown): {
  status: VerificationStatus
} {
  if (body === null || typeof body !== 'object') {
    throw new ValidationError('Request body must be a JSON object.')
  }

  const status = (body as Record<string, unknown>).status
  if (
    typeof status !== 'string' ||
    !REVIEW_STATUSES.includes(status as VerificationStatus)
  ) {
    throw new ValidationError('Status must be "approved" or "rejected".')
  }

  return { status: status as VerificationStatus }
}
