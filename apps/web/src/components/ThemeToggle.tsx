interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={onToggle}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-[var(--border)] transition-colors ${
        isDark ? 'bg-slate-700' : 'bg-amber-100'
      }`}
    >
      <span className="pointer-events-none absolute left-1.5 text-[11px] leading-none" aria-hidden>
        ☀
      </span>
      <span className="pointer-events-none absolute right-1.5 text-[11px] leading-none" aria-hidden>
        ☾
      </span>
      <span
        className={`absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow transition-transform duration-200 ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
        aria-hidden
      >
        {isDark ? '☾' : '☀'}
      </span>
    </button>
  )
}
