export type VerificationStatus = 'pending' | 'approved' | 'rejected'

/** Persistido en D1: paths/keys en R2, no URLs. */
export interface VerificationRecord {
  id: string
  name: string
  email: string
  documentNumber: string
  status: VerificationStatus
  selfieKey: string
  documentImageKey: string
  createdAt: string
  updatedAt: string
}

/** Contrato público HTTP: selfie/documentImage son URLs servibles. */
export interface Verification {
  id: string
  name: string
  email: string
  documentNumber: string
  status: VerificationStatus
  selfie: string
  documentImage: string
  createdAt: string
  updatedAt: string
}

export interface CreateVerificationInput {
  id: string
  name: string
  email: string
  documentNumber: string
  selfieKey: string
  documentImageKey: string
}

export const MAX_IMAGE_BYTES = 1_000_000

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

export const REVIEW_STATUSES: readonly VerificationStatus[] = [
  'approved',
  'rejected',
] as const
