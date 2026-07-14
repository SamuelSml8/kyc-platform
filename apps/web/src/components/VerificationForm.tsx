import { useState, type FormEvent } from 'react'
import { ImageUpload } from './ImageUpload'

export interface VerificationFormValues {
  name: string
  email: string
  documentNumber: string
  selfie: File
  documentImage: File
}

interface VerificationFormProps {
  loading: boolean
  error: string | null
  onSubmit: (values: VerificationFormValues) => Promise<void> | void
}

export function VerificationForm({ loading, error, onSubmit }: VerificationFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [selfie, setSelfie] = useState<File | null>(null)
  const [documentImage, setDocumentImage] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!name.trim() || !email.trim() || !documentNumber.trim()) {
      setFormError('Completa nombre completo, email y número de documento.')
      return
    }
    if (!selfie || !documentImage) {
      setFormError('Sube la selfie y la foto del documento.')
      return
    }

    await onSubmit({
      name: name.trim(),
      email: email.trim(),
      documentNumber: documentNumber.trim(),
      selfie,
      documentImage,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="name"
          label="Nombre completo"
          value={name}
          onChange={setName}
          autoComplete="name"
          disabled={loading}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={loading}
        />
      </div>

      <Field
        id="documentNumber"
        label="Número de documento"
        value={documentNumber}
        onChange={setDocumentNumber}
        disabled={loading}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <ImageUpload label="Selfie" file={selfie} onChange={setSelfie} />
        <ImageUpload
          label="Foto del documento"
          file={documentImage}
          onChange={setDocumentImage}
        />
      </div>

      {(formError || error) && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
        >
          {formError ?? error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? 'Enviando…' : 'Enviar verificación'}
      </button>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  disabled?: boolean
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  disabled,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--ink)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2 disabled:opacity-60"
      />
    </div>
  )
}
