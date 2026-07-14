import type { ParsedCreateFields, ParsedImageFile } from '../domain/validation'
import type {
  VerificationRecord,
  VerificationStatus,
} from '../domain/types'
import type { ImageStorage } from '../storage/types'
import type { VerificationStore } from '../store/types'

/**
 * Orquesta validación ya parseada + R2 + D1.
 * Las routes solo traducen HTTP ↔ este servicio.
 */
export class VerificationService {
  constructor(
    private readonly store: VerificationStore,
    private readonly images: ImageStorage,
  ) {}

  async create(
    fields: ParsedCreateFields,
    selfie: ParsedImageFile,
    documentImage: ParsedImageFile,
  ): Promise<VerificationRecord> {
    const id = crypto.randomUUID()
    const selfieKey = `verifications/${id}/selfie.${selfie.extension}`
    const documentImageKey = `verifications/${id}/document.${documentImage.extension}`

    await this.images.put(selfieKey, selfie.data, selfie.contentType)
    await this.images.put(
      documentImageKey,
      documentImage.data,
      documentImage.contentType,
    )

    return this.store.create({
      id,
      ...fields,
      selfieKey,
      documentImageKey,
    })
  }

  findById(id: string): Promise<VerificationRecord | null> {
    return this.store.findById(id)
  }

  updateStatus(
    id: string,
    status: VerificationStatus,
  ): Promise<VerificationRecord | null> {
    return this.store.updateStatus(id, status)
  }
}
