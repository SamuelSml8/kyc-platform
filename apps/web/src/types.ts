export type VerificationStatus = 'pending' | 'approved' | 'rejected'

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

export interface CreateVerificationPayload {
  name: string
  email: string
  documentNumber: string
  selfie: File
  documentImage: File
}

export const MAX_IMAGE_BYTES = 1_000_000
