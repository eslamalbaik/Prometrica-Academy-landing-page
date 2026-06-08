import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Globe } from 'lucide-react'
import { api } from '@/lib/api'
import { pageTitle } from '@/lib/siteMeta'
import logo from '@/assets/prometrica-logo.png'

type ResetSearch = { token?: string; email?: string }

export const Route = createFileRoute('/reset-password')({
  head: () => ({
    meta: [{ title: pageTitle('Reset Password') }],
  }),
  validateSearch: (search: Record<string, unknown>): ResetSearch => {
    const pick = (k: string): string | undefined => {
      // Defensive: some mail clients leave "&amp;" in the link, which parses the
      // second param as "amp;email" / "amp;token". Read both spellings.
      const v = search[k] ?? search[`amp;${k}`]
      return typeof v === 'string' ? v : undefined
    }
    return { token: pick('token'), email: pick('email') }
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { token, email } = Route.useSearch()

  const isAr = i18n.language === 'ar'
  const dir  = isAr ? 'rtl' : 'ltr'

  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPass, setShowPass]         = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess]           = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const isTokenMissing = !token || !email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError(t('auth.passwords_dont_match'))
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await api.post('/v1/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: confirm,
      })
      setSuccess(true)
      setTimeout(() => navigate({ to: '/login' }), 3000)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        t('auth.reset_failed'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const strength = (() => {
    if (password.length === 0) return 0
    let score = 0
    if (password.length >= 8)         score++
    if (/[A-Z]/.test(password))       score++
    if (/[0-9]/.test(password))       score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  })()

  const strengthLabels = [
    '',
    t('auth.strength_weak'),
    t('auth.strength_fair'),
    t('auth.strength_good'),
    t('auth.strength_strong'),
  ]
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-400', 'bg-blue-500', 'bg-emerald-500']

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4" dir={dir}>

      {/* Subtle top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="w-full max-w-md">

        {/* Header: logo + lang toggle */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Prometrica Academy" className="h-14 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {isAr ? 'English' : 'العربية'}
          </button>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg shadow-gray-100">

          {isTokenMissing ? (
            /* ── Invalid Link ── */
            <div className="text-center py-4">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border border-red-100">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('auth.invalid_link')}
              </h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                {t('auth.invalid_link_desc')}
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
              >
                {t('auth.request_new_link')}
              </Link>
            </div>

          ) : success ? (
            /* ── Success State ── */
            <div className="text-center py-4">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('auth.password_reset_success')}
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                {t('auth.password_reset_success_desc')}
              </p>
              <p className="text-xs text-gray-400 mb-8">
                {t('auth.redirecting_to_login')}
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>

          ) : (
            /* ── Form State ── */
            <>
              {/* Page heading */}
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                  {t('auth.set_new_password')}
                </h1>
                <p className="text-sm text-gray-500">
                  {t('auth.set_new_password_desc')}
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* New Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {t('auth.new_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      dir="ltr"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pe-11 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition ${isAr ? 'left-3.5' : 'right-3.5'}`}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">{strengthLabels[strength]}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {t('auth.confirm_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      dir="ltr"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-xl border bg-gray-50 px-4 py-3 pe-11 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 transition ${
                        confirm && confirm !== password
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary focus:ring-primary/15'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition ${isAr ? 'left-3.5' : 'right-3.5'}`}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {t('auth.passwords_dont_match')}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !password || !confirm || password !== confirm}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? t('auth.resetting') : t('auth.reset_password_btn')}
                </button>
              </form>

              <div className="mt-7 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
                >
                  {isAr
                    ? <><span>{t('auth.back_to_login')}</span><ArrowLeft className="h-4 w-4 rotate-180" /></>
                    : <><ArrowLeft className="h-4 w-4" /><span>{t('auth.back_to_login')}</span></>
                  }
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Prometrica Academy · {t('auth.professional_education')}
        </p>
      </div>
    </div>
  )
}
