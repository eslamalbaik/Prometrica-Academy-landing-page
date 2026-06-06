import axios from 'axios'
import type { TFunction } from 'i18next'

export function getAuthErrorMessage(err: unknown, t: TFunction): string {
  if (!axios.isAxiosError(err)) {
    return t('auth.network_error')
  }

  const status = err.response?.status
  const data = err.response?.data as {
    message?: string
    errors?: Record<string, string[]>
  } | undefined

  if (!err.response) {
    return t('auth.network_error')
  }

  if (status === 422 || status === 401 || status === 403) {
    const emailError = data?.errors?.email?.[0]
    const passwordError = data?.errors?.password?.[0]
    const message = data?.message || ''

    if (
      emailError === 'invalid_credentials'
      || emailError?.includes('credentials')
      || message === 'invalid_credentials'
      || message.includes('credentials')
    ) {
      return t('auth.invalid_credentials')
    }

    if (emailError)
      return emailError
    if (passwordError)
      return passwordError
    if (message)
      return message
  }

  if (status === 429) {
    return t('auth.too_many_attempts', 'Too many attempts. Please wait a minute and try again.')
  }

  if (status && status >= 500) {
    return t('auth.server_error', 'Server error. Please try again later.')
  }

  return t('auth.network_error')
}
