import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { pageTitle } from '@/lib/siteMeta'

export const Route = createFileRoute('/forgot-password')({
  head: () => ({
    meta: [{ title: pageTitle('Forgot Password') }],
  }),
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail]           = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await api.post('/v1/auth/forgot-password', { email: email.trim() })
      setSuccess(true)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        t('auth.reset_link_error', 'Could not send reset link. Please check the email address.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <span className="text-xl font-black text-white">P</span>
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Prometrica <span className="text-primary">Academy</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 tracking-wide">
            {t('auth.professional_education', 'Professional Pharmacy Education')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">

          {success ? (
            /* ── Success State ── */
            <div className="text-center py-4">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                {t('auth.check_your_email', 'Check your email')}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-2">
                {t('auth.reset_link_sent', "We've sent a password reset link to")}
              </p>
              <p className="font-semibold text-primary mb-6">{email}</p>
              <p className="text-xs text-slate-500 mb-8">
                {t('auth.reset_link_expires', "The link expires in 60 minutes. Check your spam folder if you don't see it.")}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.back_to_login', 'Back to Sign In')}
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <div className="mb-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {t('auth.forgot_password_title', 'Forgot Password?')}
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t('auth.forgot_password_desc', "No worries! Enter your email and we'll send you a reset link.")}
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    {t('auth.email_label', 'Email Address')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('placeholders.enter_email', 'you@example.com')}
                      className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting
                    ? t('auth.sending', 'Sending…')
                    : t('auth.send_reset_link', 'Send Reset Link')}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('auth.back_to_login', 'Back to Sign In')}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Prometrica Academy · All rights reserved
        </p>
      </div>
    </div>
  )
}
