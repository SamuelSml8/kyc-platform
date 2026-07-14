import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { MAX_IMAGE_BYTES } from '../types'

const ACCEPT = 'image/jpeg,image/png,image/webp'

interface ImageUploadProps {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  error?: string | null
}

export function ImageUpload({ label, file, onChange, error }: ImageUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleFile(next: File | undefined) {
    setLocalError(null)
    if (!next) return

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(next.type)) {
      setLocalError('Solo se permiten imágenes JPEG, PNG o WebP.')
      onChange(null)
      return
    }

    if (next.size > MAX_IMAGE_BYTES) {
      setLocalError(`La imagen supera ${(MAX_IMAGE_BYTES / 1_000_000).toFixed(0)} MB.`)
      onChange(null)
      return
    }

    onChange(next)
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0])
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  const message = error ?? localError

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-[var(--ink)]">
        {label}
      </label>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition ${
          dragging
            ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
            : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
        }`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={onInputChange}
        />

        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Vista previa: ${label}`}
            className="max-h-40 max-w-full rounded-lg object-contain"
          />
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--ink)]">
              Arrastra una imagen o haz clic
            </p>
            <p className="text-xs text-[var(--muted)]">JPEG, PNG o WebP · máx. 1 MB</p>
          </>
        )}
      </div>

      {file ? (
        <button
          type="button"
          className="text-sm text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
          onClick={() => {
            onChange(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
        >
          Quitar imagen
        </button>
      ) : null}

      {message ? <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p> : null}
    </div>
  )
}
