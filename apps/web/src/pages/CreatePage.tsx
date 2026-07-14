import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, createVerification } from '../api/client'
import {
  VerificationForm,
  type VerificationFormValues,
} from '../components/VerificationForm'

export function CreatePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(values: VerificationFormValues) {
    setLoading(true)
    setError(null)
    try {
      const verification = await createVerification(values)
      navigate(`/verification/${verification.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="font-display text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          KYC Platform
        </p>
        <h1 className="text-lg font-medium text-[var(--ink)] sm:text-xl">
          Validación de identidad
        </h1>
        <p className="max-w-xl text-[var(--muted)]">
          Completa tus datos y sube una selfie junto a tu documento. La revisión
          queda en pendiente hasta que se apruebe o rechace.
        </p>
      </header>

      <VerificationForm loading={loading} error={error} onSubmit={handleSubmit} />
    </section>
  )
}
