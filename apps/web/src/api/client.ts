import type {
  CreateVerificationPayload,
  Verification,
  VerificationStatus,
} from '../types'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface ApiEnvelope<T> {
  ok: boolean
  message: string
  data: T | null
}

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL
  if (!url || typeof url !== 'string') {
    throw new ApiError(
      'Missing VITE_API_URL. Copy .env.example to .env and set the API URL.',
      500,
    )
  }
  return url.replace(/\/$/, '')
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${getBaseUrl()}${path}`, init)
  } catch {
    throw new ApiError('Unable to reach the API. Is the Worker running?', 0)
  }

  let envelope: ApiEnvelope<T>
  try {
    envelope = (await res.json()) as ApiEnvelope<T>
  } catch {
    throw new ApiError(`Unexpected response (HTTP ${res.status}).`, res.status)
  }

  if (!res.ok || !envelope.ok || envelope.data === null) {
    throw new ApiError(
      envelope.message || `Request failed (HTTP ${res.status}).`,
      res.status,
    )
  }

  return envelope.data
}

export function createVerification(
  payload: CreateVerificationPayload,
): Promise<Verification> {
  const form = new FormData()
  form.set('name', payload.name)
  form.set('email', payload.email)
  form.set('documentNumber', payload.documentNumber)
  form.set('selfie', payload.selfie)
  form.set('documentImage', payload.documentImage)

  // No fijar Content-Type: el browser añade el boundary multipart
  return requestJson<Verification>('/verification', {
    method: 'POST',
    body: form,
  })
}

export function getVerification(id: string): Promise<Verification> {
  return requestJson<Verification>(`/verification/${id}`)
}

export function updateVerificationStatus(
  id: string,
  status: Extract<VerificationStatus, 'approved' | 'rejected'>,
): Promise<Verification> {
  return requestJson<Verification>(`/verification/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}
