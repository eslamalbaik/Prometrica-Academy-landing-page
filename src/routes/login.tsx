import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthDivider, GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { loginWithEmail } from '@/lib/authApi'
import { resolvePostAuthRedirect, FRONTEND_URL } from '@/lib/authSession'
import { normalizeUser } from '@/lib/normalizeUser'
import { getAuthErrorMessage } from '@/lib/authErrors'
import { pageTitle } from '@/lib/siteMeta'

type LoginSearch = {
  to?: string
  logout?: string
  error?: string
}

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [{ title: pageTitle('Sign In') }],
  }),
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    to: typeof search.to === 'string' ? search.to : undefined,
    logout: typeof search.logout === 'string' ? search.logout : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, user, isAuthenticated, isReady } = useAuth()
  const { to, error: errorCode } = Route.useSearch()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (isReady && isAuthenticated && user) {
      const dest = resolvePostAuthRedirect(user, to, '/student/dashboard')
      if (dest.startsWith('http'))
        window.location.href = dest
      else
        navigate({ to: dest })
    }
  }, [isReady, isAuthenticated, user, to, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      const data = await loginWithEmail(email.trim(), password)
      const user = normalizeUser(data.user)
      if (!user)
        throw new Error('Invalid user')

      login(user, data.token)
      setIsSuccess(true)
      setIsSubmitting(false)

      await new Promise(r => setTimeout(r, 450))

      const dest = resolvePostAuthRedirect(user, to, data.redirect_url)
      if (dest.startsWith('http'))
        window.location.href = dest
      else
        navigate({ to: dest })
    }
    catch (err) {
      setIsSubmitting(false)
      setIsSuccess(false)
      setError(getAuthErrorMessage(err, t))
    }
  }

  const registerHref = to ? `/register?to=${encodeURIComponent(to)}` : '/register'

  const oauthMessage = errorCode === 'google_not_configured'
    ? t('auth.google_not_configured', 'Google sign-in is not configured on this server.')
    : null

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="mb-8 text-center lg:text-start">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('auth.login_title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.login_card_subtitle')}
          </p>
        </div>

        <GoogleSignInButton returnTo={to} mode="login" />
        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-5">
          {oauthMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-900 dark:text-amber-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{oauthMessage}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {error}
                {error === t('auth.invalid_credentials') && (
                  <>
                    {' '}
                    <Link to={registerHref} className="font-semibold underline">
                      {t('auth.sign_up_now')}
                    </Link>
                  </>
                )}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email_label')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              dir="ltr"
              className="h-11 rounded-xl"
              placeholder={t('placeholders.enter_email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">{t('auth.password_label')}</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline font-semibold"
              >
                {t('auth.forgot_password')}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                dir="ltr"
                className="h-11 rounded-xl pe-10"
                placeholder={t('placeholders.enter_password')}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(v => !v)}
                aria-label={t('auth.toggle_password')}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || isSuccess}
            className={`h-11 w-full rounded-xl text-sm font-semibold ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSuccess && <CheckCircle2 className="h-4 w-4" />}
            {!isSubmitting && !isSuccess && t('auth.login_btn')}
            {isSuccess && t('auth.success')}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('auth.dont_have_account')}
          {' '}
          <Link to={registerHref} className="font-semibold text-primary hover:underline">
            {t('auth.sign_up_now')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
