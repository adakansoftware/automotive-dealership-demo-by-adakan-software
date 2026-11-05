import { describe, expect, it } from 'vitest'
import { formatMileage, formatPrice } from '@/lib/format'

describe('formatPrice', () => {
  it('TRY para birimi biçiminde binlik ayraç kullanır', () => {
    expect(formatPrice(8950000)).toMatch(/8\.950\.000/)
    expect(formatPrice(8950000)).toMatch(/₺|TL/)
  })

  it('ondalık basamak göstermez', () => {
    expect(formatPrice(4000000)).not.toMatch(/,/)
  })

  it('sıfır değeri güvenli biçimlenir', () => {
    expect(formatPrice(0)).toMatch(/0/)
  })
})

describe('formatMileage', () => {
  it('binlik ayraç + km birimi ekler', () => {
    expect(formatMileage(12400)).toMatch(/12\.400/)
    expect(formatMileage(12400)).toMatch(/km/)
  })

  it('sıfır değeri güvenli biçimlenir', () => {
    expect(formatMileage(0)).toMatch(/0/)
  })
})
