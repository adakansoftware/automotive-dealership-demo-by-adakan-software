import { describe, expect, it } from 'vitest'
import { validateInquiry } from '@/app/iletisim/validation'
import type { InquiryFormValues } from '@/app/iletisim/inquiry-state'

function makeValues(overrides: Partial<InquiryFormValues> = {}): InquiryFormValues {
  return {
    name: 'Ad Kan',
    phone: '+90 532 000 00 00',
    email: 'ornek@adakan.com',
    message: 'Bu bir test mesajıdır.',
    ...overrides,
  }
}

describe('validateInquiry', () => {
  it('geçerli değerlerde hata dönermez', () => {
    expect(validateInquiry(makeValues())).toEqual({})
  })

  it('kısa ad hata verir', () => {
    expect(validateInquiry(makeValues({ name: 'A' })).name).toBeDefined()
  })

  it('geçersiz telefon hata verir', () => {
    expect(validateInquiry(makeValues({ phone: '123' })).phone).toBeDefined()
    expect(validateInquiry(makeValues({ phone: 'telefon numarası' })).phone).toBeDefined()
  })

  it('boşluklu telefon biçimleri kabul edilir', () => {
    expect(validateInquiry(makeValues({ phone: '+90 (532) 000-00-00' })).phone).toBeUndefined()
  })

  it('geçersiz e-posta hata verir', () => {
    expect(validateInquiry(makeValues({ email: 'adakan' })).email).toBeDefined()
    expect(validateInquiry(makeValues({ email: 'adakan@' })).email).toBeDefined()
    expect(validateInquiry(makeValues({ email: '@adakan.com' })).email).toBeDefined()
  })

  it('kısa mesaj hata verir', () => {
    expect(validateInquiry(makeValues({ message: 'kısa' })).message).toBeDefined()
  })

  it('çoklu hata aynı anda döner', () => {
    const errors = validateInquiry(makeValues({ name: '', email: 'kotu' }))
    expect(Object.keys(errors).sort()).toEqual(['email', 'name'])
  })
})
