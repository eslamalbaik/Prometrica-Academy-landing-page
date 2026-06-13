import axios from 'axios'
import { api } from '@/lib/api'
import type { AuthUser } from '@/lib/normalizeUser'
import { sanitizeLandingReturnUrl } from '@/lib/authUrl'

const API_ORIGIN = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000').replace(/\/$/, '')
const LANDING_ORIGIN = (import.meta.env.VITE_LANDING_URL || 'http://localhost:8080').replace(/\/$/, '')
export const FRONTEND_URL = (import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

export const GOOGLE_AUTH_ENABLED = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true'
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export function clearStoredAuth() {
  if (typeof localStorage === 'undefined')
    return
  localStorage.removeItem('userData')
  localStorage.removeItem('accessToken')
}

export async function revokeServerSession(accessToken: string | null | undefined) {
  if (!accessToken)
    return

  try {
    await axios.post(`${API_ORIGIN}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })
  }
  catch {
    // Session may already be invalid
  }
}

export function getLoginUrl(returnTo?: string) {
  const url = new URL(`${LANDING_ORIGIN}/login`)
  if (returnTo)
    url.searchParams.set('to', sanitizeLandingReturnUrl(returnTo))
  return url.toString()
}

export function getRegisterUrl(returnTo?: string) {
  const url = new URL(`${LANDING_ORIGIN}/register`)
  if (returnTo)
    url.searchParams.set('to', sanitizeLandingReturnUrl(returnTo))
  return url.toString()
}

export function getGoogleAuthUrl(returnTo?: string) {
  const url = new URL(`${API_ORIGIN}/auth/google/redirect`)
  if (returnTo)
    url.searchParams.set('return_to', returnTo)
  return url.toString()
}

export function redirectToLandingLogout() {
  clearStoredAuth()
  window.location.href = `${LANDING_ORIGIN}/?logout=1`
}

export async function fetchSessionUser(accessToken: string) {
  const res = await api.get('/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.data
}

/** Where to send the user after a successful login/register on the landing app. */
export function resolvePostAuthRedirect(
  user: AuthUser,
  returnTo?: string | null,
  apiRedirect?: string | null,
): string {
  if (returnTo) {
    const clean = sanitizeLandingReturnUrl(returnTo)
    if (clean.startsWith('/') || clean.startsWith(LANDING_ORIGIN))
      return clean.startsWith('http') ? sanitizeLandingReturnUrl(clean) : clean
  }

  if (user.role === 'admin')
    return `${FRONTEND_URL}/dashboards/lms`

  if (apiRedirect?.startsWith(LANDING_ORIGIN))
    return sanitizeLandingReturnUrl(apiRedirect)

  return '/student/dashboard'
}
