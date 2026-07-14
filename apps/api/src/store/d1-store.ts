import type {
  CreateVerificationInput,
  VerificationRecord,
  VerificationStatus,
} from '../domain/types'
import type { VerificationStore } from './types'

interface VerificationRow {
  id: string
  name: string
  email: string
  document_number: string
  status: VerificationStatus
  selfie_key: string
  document_image_key: string
  created_at: string
  updated_at: string
}

function mapRow(row: VerificationRow): VerificationRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    documentNumber: row.document_number,
    status: row.status,
    selfieKey: row.selfie_key,
    documentImageKey: row.document_image_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1VerificationStore implements VerificationStore {
  constructor(private readonly db: D1Database) {}

  async create(input: CreateVerificationInput): Promise<VerificationRecord> {
    const now = new Date().toISOString()

    await this.db
      .prepare(
        `INSERT INTO verifications
          (id, name, email, document_number, status, selfie_key, document_image_key, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      )
      .bind(
        input.id,
        input.name,
        input.email,
        input.documentNumber,
        input.selfieKey,
        input.documentImageKey,
        now,
        now,
      )
      .run()

    const created = await this.findById(input.id)
    if (!created) {
      throw new Error('Failed to read verification after insert.')
    }
    return created
  }

  async findById(id: string): Promise<VerificationRecord | null> {
    const row = await this.db
      .prepare(
        `SELECT id, name, email, document_number, status,
                selfie_key, document_image_key, created_at, updated_at
         FROM verifications WHERE id = ?`,
      )
      .bind(id)
      .first<VerificationRow>()

    return row ? mapRow(row) : null
  }

  async updateStatus(
    id: string,
    status: VerificationStatus,
  ): Promise<VerificationRecord | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const now = new Date().toISOString()
    await this.db
      .prepare(
        'UPDATE verifications SET status = ?, updated_at = ? WHERE id = ?',
      )
      .bind(status, now, id)
      .run()

    return this.findById(id)
  }
}
