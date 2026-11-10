import { describe, expect, it } from 'vitest'

import { buildInquiryEmail } from './email'

describe('buildInquiryEmail', () => {
  const values = { name: 'Ayşe Yılmaz', phone: '0532 000 00 00', email: 'ayse@example.com', message: 'Merhaba, araç hakkında bilgi almak istiyorum.' }

  it('includes all contact fields and message', () => {
    const { subject, text } = buildInquiryEmail(values, 'Atelier Motors')
    expect(subject).toBe('Yeni iletişim formu mesajı — Ayşe Yılmaz')
    expect(text).toContain('Ad Soyad: Ayşe Yılmaz')
    expect(text).toContain('Telefon: 0532 000 00 00')
    expect(text).toContain('E-posta: ayse@example.com')
    expect(text).toContain('Mesaj:')
    expect(text).toContain('Merhaba, araç hakkında bilgi almak istiyorum.')
    expect(text).toContain('Atelier Motors')
  })

  it('omits empty email line', () => {
    const { text } = buildInquiryEmail({ ...values, email: '' }, 'Atelier Motors')
    expect(text).not.toContain('E-posta:')
  })
})
