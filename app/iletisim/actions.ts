'use server'

import { headers } from 'next/headers'
import type { InquiryFormState } from './inquiry-state'
import { validateInquiry } from './validation'

/**
 * Demo rate limiter — süreç belleğinde, örnek başına.
 * Üretimde kalıcı depolamalı (Redis/DB) ve IP + oturum bazlı olmalı.
 */
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const rateLimiter = new Map<string, { count: number; resetAt: number }>()

function isWithinRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimiter.get(key)
  if (!entry || entry.resetAt < now) {
    rateLimiter.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_PER_WINDOW) return false
  entry.count++
  return true
}

const EMPTY_VALUES = { name: '', phone: '', email: '', message: '' }

export async function submitInquiry(_prev: InquiryFormState, formData: FormData): Promise<InquiryFormState> {
  const values = {
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
  }

  const errors = validateInquiry(values)
  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors, values }
  }

  const requestHeaders = await headers()
  const ip = (requestHeaders.get('x-forwarded-for') ?? 'local').split(',')[0].trim()
  if (!isWithinRateLimit(ip)) {
    return { status: 'rate-limited', errors: {}, values: EMPTY_VALUES }
  }

  // DEMO MODU: gerçek gönderim yok. Onay sonrası gönderim sağlayıcısı (SMTP/e-posta API)
  // ortam değişkenleriyle bağlanır; kimlik bilgisi koda gömülmez.
  return { status: 'success', errors: {}, values: EMPTY_VALUES }
}
