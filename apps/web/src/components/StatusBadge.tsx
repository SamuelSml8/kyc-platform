import type { VerificationStatus } from '../types'

const LABELS: Record<VerificationStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

const STYLES: Record<VerificationStatus, string> = {
  pending:
    'bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:ring-amber-800',
  approved:
    'bg-emerald-100 text-emerald-900 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:ring-emerald-800',
  rejected:
    'bg-rose-100 text-rose-900 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:ring-rose-800',
}

interface StatusBadgeProps {
  status: VerificationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
