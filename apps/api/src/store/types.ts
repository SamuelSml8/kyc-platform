import type {
  CreateVerificationInput,
  VerificationRecord,
  VerificationStatus,
} from '../domain/types'

export interface VerificationStore {
  create(input: CreateVerificationInput): Promise<VerificationRecord>
  findById(id: string): Promise<VerificationRecord | null>
  updateStatus(
    id: string,
    status: VerificationStatus,
  ): Promise<VerificationRecord | null>
}
