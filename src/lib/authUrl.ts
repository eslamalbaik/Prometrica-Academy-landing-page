const LANDING_ORIGIN = (import.meta.env.VITE_LANDING_URL || 'http://localhost:8080').replace(/\/$/, '')

const AUTH_QUERY_KEYS = ['token', 'user'] as const

export function stripAuthQueryParams(searchParams: URLSearchParams) {
  for (const key of AUTH_QUERY_KEYS)
    searchParams.delete(key)
}

/** Remove token/user from a landing return path or URL (for ?to= and post-login redirects). */
export function sanitizeLandingReturnUrl(returnTo: string): string {
  if (!returnTo)
    return returnTo

  try {
    const parsed = new URL(returnTo, LANDING_ORIGIN)
    if (parsed.origin !== LANDING_ORIGIN)
      return returnTo

    stripAuthQueryParams(parsed.searchParams)
    const search = parsed.searchParams.toString()
    return `${parsed.pathname}${search ? `?${search}` : ''}${parsed.hash}`
  }
  catch {
    if (returnTo.startsWith('/') && !returnTo.startsWith('//')) {
      const [path, query = ''] = returnTo.split('?')
      if (!query)
        return path

      const params = new URLSearchParams(query)
      stripAuthQueryParams(params)
      const cleaned = params.toString()
      return `${path}${cleaned ? `?${cleaned}` : ''}`
    }
    return returnTo
  }
}

// Pages that own their own `token` query param and must not have it consumed by auth bootstrap.
const PAGES_WITH_OWN_TOKEN = ['/reset-password']

/**
 * Read token from the current URL once, then remove token/user from the address bar immediately.
 * Skipped on pages that use `token` for their own purpose (e.g. password reset).
 */
export function consumeTokenFromCurrentUrl(): string | null {
  if (typeof window === 'undefined')
    return null

  if (PAGES_WITH_OWN_TOKEN.some(p => window.location.pathname === p))
    return null

  const url = new URL(window.location.href)
  const token = url.searchParams.get('token')
  if (!token)
    return null

  stripAuthQueryParams(url.searchParams)
  const clean = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', clean)

  return token
}
