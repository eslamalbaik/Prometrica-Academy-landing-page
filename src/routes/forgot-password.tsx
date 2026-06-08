import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Globe } from 'lucide-react'
import { api } from '@/lib/api'
import { pageTitle } from '@/lib/siteMeta'
import logo from '@/assets/prometrica-logo.png'

export const Route = createFileRoute('/forgot-password')({
  head: () => ({
    meta: [{ title: pageTitle('Forgot Password') }],
  }),
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const dir = isAr ? 'rtl' : 'ltr'

  const [email, setEmail]               = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess]           = useState(false)
  const [error, setError]               = useState<string | null>(null)

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
    <div className="min-h-screen bg-white flex items-center justify-center px-4" dir={dir}>
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
          {success ? (
            /* ── Success ── */
            <div className="text-center py-4">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('auth.check_your_email', 'Check your email')}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-1">
                {t('auth.reset_link_sent', "We've sent a password reset link to")}
              </p>
              <p className="font-semibold text-primary mb-5 break-all">{email}</p>
              <p className="text-xs text-gray-400 mb-8">
                {t('auth.reset_link_expires', "The link expires in 60 minutes. Check your spam folder if you don't see it.")}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
              >
                {isAr ? <><span>{t('auth.back_to_login', 'Back to Sign In')}</span><ArrowLeft className="h-4 w-4 rotate-180" /></>
                      : <><ArrowLeft className="h-4 w-4" /><span>{t('auth.back_to_login', 'Back to Sign In')}</span></>}
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                  {t('auth.forgot_password_title', 'Forgot Password?')}
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t('auth.forgot_password_desc', "No worries! Enter your email and we'll send you a reset link.")}
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {t('auth.email_label', 'Email Address')}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none ${isAr ? 'right-3.5' : 'left-3.5'}`} />
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('placeholders.enter_email', 'you@example.com')}
                      className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition ${isAr ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? t('auth.sending', 'Sending…') : t('auth.send_reset_link', 'Send Reset Link')}
                </button>
              </form>

              <div className="mt-7 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
                >
                  {isAr ? <><span>{t('auth.back_to_login', 'Back to Sign In')}</span><ArrowLeft className="h-4 w-4 rotate-180" /></>
                        : <><ArrowLeft className="h-4 w-4" /><span>{t('auth.back_to_login', 'Back to Sign In')}</span></>}
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Prometrica Academy · {t('auth.professional_education', 'Professional Pharmacy Education')}
        </p>
      </div>
    </div>
  )
}
