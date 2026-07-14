import type {
  CreateVerificationInput,
  VerificationRecord,
  VerificationStatus,
} from '../domain/types'
import type { VerificationStore } from './types'

/** Store en memoria para tests — mismo contrato que D1. */
export class MemoryVerificationStore implements VerificationStore {
  private readonly items = new Map<string, VerificationRecord>()

  async create(input: CreateVerificationInput): Promise<VerificationRecord> {
    const now = new Date().toISOString()
    const verification: VerificationRecord = {
      id: input.id,
      name: input.name,
      email: input.email,
      documentNumber: input.documentNumber,
      status: 'pending',
      selfieKey: input.selfieKey,
      documentImageKey: input.documentImageKey,
      createdAt: now,
      updatedAt: now,
    }
    this.items.set(verification.id, verification)
    return verification
  }

  async findById(id: string): Promise<VerificationRecord | null> {
    return this.items.get(id) ?? null
  }

  async updateStatus(
    id: string,
    status: VerificationStatus,
  ): Promise<VerificationRecord | null> {
    const existing = this.items.get(id)
    if (!existing) return null
    const updated: VerificationRecord = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    }
    this.items.set(id, updated)
    return updated
  }
}
