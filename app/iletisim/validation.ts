import type { InquiryFormValues } from './inquiry-state'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_PATTERN = /^[\d\s()+-]{10,20}$/

/** Saf doğrulama — istemci ve sunucu tarafında paylaşılır. */
export function validateInquiry(values: InquiryFormValues): Partial<Record<keyof InquiryFormValues, string>> {
  const errors: Partial<Record<keyof InquiryFormValues, string>> = {}
  if (values.name.length < 2) errors.name = 'Lütfen adınızı ve soyadınızı girin.'
  if (!PHONE_PATTERN.test(values.phone)) errors.phone = 'Lütfen geçerli bir telefon numarası girin (örn. +90 5xx xxx xx xx).'
  if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Lütfen geçerli bir e-posta adresi girin.'
  if (values.message.length < 10) errors.message = 'Lütfen en az 10 karakterlik bir mesaj yazın.'
  return errors
}
