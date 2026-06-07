import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { normalizeUser } from '@/lib/normalizeUser'
import { resolvePostAuthRedirect } from '@/lib/authSession'

export const Route = createFileRoute('/auth/google/callback')({
  component: GoogleCallbackPage,
})

function GoogleCallbackPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const didExchange = useRef(false)

  useEffect(() => {
    if (didExchange.current) return
    didExchange.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code) {
      navigate({ to: '/login', search: { error: 'google_callback_pending' } })
      return
    }

    api
      .post('/auth/google/exchange', { code })
      .then((res) => {
        const { token, user: rawUser, redirect_url } = res.data
        const user = normalizeUser(rawUser)
        if (!user) throw new Error('Invalid user')

        login(user, token)

        const dest = resolvePostAuthRedirect(user, null, redirect_url)
        if (dest.startsWith('http')) {
          window.location.href = dest
        } else {
          navigate({ to: dest })
        }
      })
      .catch(() => {
        navigate({ to: '/login', search: { error: 'google_callback_pending' } })
      })
  }, [login, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">
          Completing sign-in with Google…
        </p>
      </div>
    </div>
  )
}
