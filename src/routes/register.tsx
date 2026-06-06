import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthDivider, GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { registerWithEmail } from '@/lib/authApi'
import { resolvePostAuthRedirect } from '@/lib/authSession'
import { normalizeUser } from '@/lib/normalizeUser'
import { getAuthErrorMessage } from '@/lib/authErrors'
import { pageTitle } from '@/lib/siteMeta'

type RegisterSearch = {
  to?: string
}

export const Route = createFileRoute('/register')({
  head: () => ({
    meta: [{ title: pageTitle('Create Account') }],
  }),
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    to: typeof search.to === 'string' ? search.to : undefined,
  }),
  component: RegisterPage,
})

function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, user, isAuthenticated, isReady } = useAuth()
  const { to } = Route.useSearch()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
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
    const nextErrors: Record<string, string> = {}

    if (!name.trim())
      nextErrors.name = t('auth.name_required', 'Name is required')
    if (!email.trim())
      nextErrors.email = t('auth.email_required', 'Email is required')
    if (password.length < 6)
      nextErrors.password = t('auth.password_min', 'Password must be at least 6 characters')
    if (password !== confirmPassword)
      nextErrors.confirm = t('auth.password_mismatch', 'Passwords do not match')
    if (!acceptTerms)
      nextErrors.terms = t('auth.terms_required', 'Please accept the terms to continue')

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      const data = await registerWithEmail(name.trim(), email.trim(), password)
      const user = normalizeUser(data.user)
      if (!user)
        throw new Error('Invalid user')

      login(user, data.token)
      setIsSuccess(true)
      setIsSubmitting(false)

      await new Promise(r => setTimeout(r, 450))

      const dest = resolvePostAuthRedirect(user, to, data.redirect_url || '/student/dashboard')
      if (dest.startsWith('http'))
        window.location.href = dest
      else
        navigate({ to: dest })
    }
    catch (err) {
      setIsSubmitting(false)
      setIsSuccess(false)
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const server = err.response.data?.errors || {}
        setErrors({
          name: server.name?.[0] || undefined,
          email: server.email?.[0] || undefined,
          password: server.password?.[0] || undefined,
          form: !server.name && !server.email && !server.password
            ? getAuthErrorMessage(err, t)
            : undefined,
        })
      }
      else {
        setErrors({ form: getAuthErrorMessage(err, t) })
      }
    }
  }

  const loginHref = to ? `/login?to=${encodeURIComponent(to)}` : '/login'

  return (
    <AuthLayout variant="register">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="mb-8 text-center lg:text-start">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('auth.register_title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.register_card_subtitle')}
          </p>
        </div>

        <GoogleSignInButton returnTo={to} mode="register" />
        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t('auth.name_label')}</Label>
            <Input
              id="name"
              required
              autoComplete="name"
              className="h-11 rounded-xl"
              placeholder={t('placeholders.enter_name')}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email_label')}</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              className="h-11 rounded-xl"
              placeholder={t('placeholders.enter_email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password_label')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                dir="ltr"
                className="h-11 rounded-xl pe-10"
                placeholder={t('placeholders.enter_password')}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">{t('auth.confirm_password_label')}</Label>
            <Input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              dir="ltr"
              className="h-11 rounded-xl"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={e => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-muted-foreground leading-snug">
              {t('auth.agree_terms', 'I agree to the terms of service and privacy policy')}
            </span>
          </label>
          {errors.terms && <p className="text-xs text-destructive -mt-2">{errors.terms}</p>}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || isSuccess}
            className={`h-11 w-full rounded-xl text-sm font-semibold ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSuccess && <CheckCircle2 className="h-4 w-4" />}
            {!isSubmitting && !isSuccess && t('auth.register_btn')}
            {isSuccess && t('auth.success', 'Success!')}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('auth.already_have_account')}
          {' '}
          <Link to={loginHref} className="font-semibold text-primary hover:underline">
            {t('auth.login_now')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
