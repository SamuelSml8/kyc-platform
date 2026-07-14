import { Navigate, Route, Routes } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { useTheme } from './hooks/useTheme'
import { CreatePage } from './pages/CreatePage'
import { DetailPage } from './pages/DetailPage'

export default function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--glow)_0%,_transparent_55%),linear-gradient(160deg,_var(--bg)_0%,_var(--bg-deep)_100%)]" />

      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-6 sm:px-6">
        <span className="text-sm font-semibold tracking-wide text-[var(--ink)]">
          KYC
        </span>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 sm:px-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/80 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-8">
          <Routes>
            <Route path="/" element={<CreatePage />} />
            <Route path="/verification/:id" element={<DetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-4 pb-8 pt-2 text-center sm:px-6">
        <p className="text-sm text-[var(--muted)]">
          Prueba técnica — Samuel Vera Miranda
        </p>
      </footer>
    </div>
  )
}
