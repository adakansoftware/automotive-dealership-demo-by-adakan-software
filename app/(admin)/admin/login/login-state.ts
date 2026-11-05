'use server'

import { AuthError } from 'next-auth'
import { headers } from 'next/headers'

import { signIn } from '@/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export interface LoginState {
  error: string
}

/** Giriş denemeleri için sıkı limit: 15 dk / 5 deneme (tasarım dokümanı §4). */
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 5

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'E-posta ve şifre zorunludur.' }
  }

  const requestHeaders = await headers()
  const ip = (requestHeaders.get('x-forwarded-for') ?? 'local').split(',')[0].trim()
  const allowed = await checkRateLimit(`admin-login:${ip}`, {
    windowMs: LOGIN_WINDOW_MS,
    max: LOGIN_MAX_ATTEMPTS,
  })
  if (!allowed) {
    return { error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.' }
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/admin' })
    return { error: '' }
  } catch (error) {
    // Başarılı giriş NEXT_REDIRECT fırlatır — o akış akmaya bırakılır.
    if (error instanceof AuthError) {
      return { error: 'E-posta veya şifre hatalı.' }
    }
    throw error
  }
}
