'use server'

import { headers } from 'next/headers'
import type { InquiryFormState, InquiryFormValues } from './inquiry-state'

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[\d\s()+-]{10,20}$/

function validate(values: InquiryFormValues): InquiryFormState['errors'] {
  const errors: InquiryFormState['errors'] = {}
  if (values.name.length < 2) errors.name = 'Lütfen adınızı ve soyadınızı girin.'
  if (!PHONE_PATTERN.test(values.phone)) errors.phone = 'Lütfen geçerli bir telefon numarası girin (örn. +90 5xx xxx xx xx).'
  if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Lütfen geçerli bir e-posta adresi girin.'
  if (values.message.length < 10) errors.message = 'Lütfen en az 10 karakterlik bir mesaj yazın.'
  return errors
}

export async function submitInquiry(_prev: InquiryFormState, formData: FormData): Promise<InquiryFormState> {
  const values: InquiryFormValues = {
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
  }

  const errors = validate(values)
  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors, values }
  }

  const requestHeaders = await headers()
  const ip = (requestHeaders.get('x-forwarded-for') ?? 'local').split(',')[0].trim()
  if (!isWithinRateLimit(ip)) {
    return { status: 'rate-limited', errors: {}, values: { name: '', phone: '', email: '', message: '' } }
  }

  // DEMO MODU: gerçek gönderim yok. Onay sonrası gönderim sağlayıcısı (SMTP/e-posta API)
  // ortam değişkenleriyle bağlanır; kimlik bilgisi koda gömülmez.
  return { status: 'success', errors: {}, values: { name: '', phone: '', email: '', message: '' } }
}
