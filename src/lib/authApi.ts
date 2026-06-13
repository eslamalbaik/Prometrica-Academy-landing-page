import axios from 'axios'
import type { AuthUser } from '@/lib/normalizeUser'

const API_ORIGIN = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000').replace(/\/$/, '')

export interface AuthResponse {
  success: boolean
  token: string
  redirect_url?: string
  user: AuthUser & { fullName?: string }
  message?: string
}

const authHttp = axios.create({
  baseURL: API_ORIGIN,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export async function loginWithEmail(email: string, password: string) {
  const res = await authHttp.post<AuthResponse>('/login', { email, password })
  return res.data
}

export async function registerWithEmail(name: string, email: string, password: string) {
  const res = await authHttp.post<AuthResponse>('/register', {
    name,
    email,
    password,
    password_confirmation: password,
  })
  return res.data
}
