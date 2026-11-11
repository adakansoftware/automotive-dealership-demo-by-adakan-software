'use server'

import { headers } from 'next/headers'

import { getDb, isDbConfigured } from '@/db'
import { inquiries as inquiriesTable } from '@/drizzle/schema'
import { sendInquiryEmail } from '@/lib/email'
import { getSiteConfig } from '@/lib/site-config'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'
import type { InquiryFormState } from './inquiry-state'
import { validateInquiry } from './validation'

/** Pencere: 10 dakika / 5 istek — DB varsa kalıcı, yoksa süreç belleği. */
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

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

  // Honeypot: görünmez alanı bot doldurduysa başarı gibi davran, hiçbir şey kaydetme.
  if (String(formData.get('website') ?? '').trim() !== '') {
    return { status: 'success', errors: {}, values: EMPTY_VALUES }
  }

  const requestHeaders = await headers()
  const ip = (requestHeaders.get('x-forwarded-for') ?? 'local').split(',')[0].trim()
  const withinLimit = await checkRateLimit(`inquiry:${ip}`, {
    windowMs: WINDOW_MS,
    max: MAX_PER_WINDOW,
  })
  if (!withinLimit) {
    return { status: 'rate-limited', errors: {}, values: EMPTY_VALUES }
  }

  // DB yapılandırılmışsa sorgu kalıcı olarak kaydedilir (admin panelde görünür).
  if (isDbConfigured()) {
    const db = getDb()
    await db.insert(inquiriesTable).values({
      name: values.name,
      phone: values.phone,
      email: values.email,
      message: values.message,
      source: 'form',
      status: 'new',
      ipHash: hashIdentifier(ip),
    })
  }

  // SMTP tanımlıysa bildirim gönderilir; hata formu bozmaz, sorgu tabloda.
  const site = await getSiteConfig()
  await sendInquiryEmail(values, site.brand.name)

  return { status: 'success', errors: {}, values: EMPTY_VALUES }
}
