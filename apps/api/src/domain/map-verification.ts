import type { Verification, VerificationRecord } from './types'

export function toPublicVerification(
  record: VerificationRecord,
  publicBaseUrl: string,
): Verification {
  const base = publicBaseUrl.replace(/\/$/, '')
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    documentNumber: record.documentNumber,
    status: record.status,
    selfie: `${base}/files/${record.selfieKey}`,
    documentImage: `${base}/files/${record.documentImageKey}`,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}
