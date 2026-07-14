import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ApiError,
  getVerification,
  updateVerificationStatus,
} from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import type { Verification } from '../types'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const [verification, setVerification] = useState<Verification | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) {
      setError('Identificador inválido.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getVerification(id)
      setVerification(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('No se pudo cargar la verificación.')
      }
      setVerification(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function handleStatus(status: 'approved' | 'rejected') {
    if (!id) return
    setActionLoading(true)
    setError(null)
    try {
      const updated = await updateVerificationStatus(id, status)
      setVerification(updated)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('No se pudo actualizar el estado.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <p className="text-[var(--muted)]">Cargando verificación…</p>
  }

  if (!verification) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-rose-600 dark:text-rose-400">
          {error ?? 'Verificación no encontrada.'}
        </p>
        <Link to="/" className="text-sm text-[var(--accent)] underline-offset-2 hover:underline">
          Volver al formulario
        </Link>
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            to="/"
            className="text-sm text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
          >
            ← Nueva verificación
          </Link>
          <h1 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
            Resultado KYC
          </h1>
          <p className="font-mono text-xs text-[var(--muted)]">{verification.id}</p>
        </div>
        <StatusBadge status={verification.status} />
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
        >
          {error}
        </div>
      ) : null}

      <dl className="grid gap-4 sm:grid-cols-2">
        <Info label="Nombre" value={verification.name} />
        <Info label="Email" value={verification.email} />
        <Info label="Documento" value={verification.documentNumber} />
        <Info
          label="Actualizado"
          value={new Date(verification.updatedAt).toLocaleString('es')}
        />
      </dl>

      <div className="grid gap-6 sm:grid-cols-2">
        <figure className="space-y-2">
          <figcaption className="text-sm font-medium text-[var(--ink)]">Selfie</figcaption>
          <img
            src={verification.selfie}
            alt="Selfie enviada"
            className="max-h-64 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] object-contain p-2"
          />
        </figure>
        <figure className="space-y-2">
          <figcaption className="text-sm font-medium text-[var(--ink)]">
            Documento
          </figcaption>
          <img
            src={verification.documentImage}
            alt="Documento enviado"
            className="max-h-64 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] object-contain p-2"
          />
        </figure>
      </div>

      {verification.status === 'pending' ? (
        <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
          <p className="w-full text-sm text-[var(--muted)]">
            Simulación de revisión manual (demo). En producción esto requeriría
            autenticación.
          </p>
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => void handleStatus('approved')}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {actionLoading ? 'Actualizando…' : 'Aprobar'}
          </button>
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => void handleStatus('rejected')}
            className="rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
          >
            Rechazar
          </button>
        </div>
      ) : null}
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-[var(--ink)]">{value}</dd>
    </div>
  )
}
