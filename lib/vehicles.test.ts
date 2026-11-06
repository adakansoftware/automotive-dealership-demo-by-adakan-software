import { describe, expect, it } from 'vitest'
import {
  filterVehicles,
  getFeaturedVehicles,
  getRelatedVehicles,
  getVehicleBySlug,
  getVehicleImages,
  getVehicles,
  sortVehicles,
} from '@/lib/vehicles'
import type { Vehicle } from '@/types/vehicle'

function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    slug: 'test-vehicle',
    brand: 'BMW',
    model: '5 Serisi',
    trim: '530i',
    year: 2023,
    price: 4000000,
    mileage: 10000,
    fuel: 'Benzin',
    transmission: 'Otomatik',
    body: 'Sedan',
    color: 'Siyah',
    image: '/test.jpg',
    description: 'Test aracı.',
    ...overrides,
  }
}

describe('getVehicles', () => {
  it('demo envanterinin tamamını döner', async () => {
    expect((await getVehicles()).length).toBeGreaterThan(0)
  })
})

describe('getVehicleBySlug', () => {
  it('geçerli slug araçla eşleşir', async () => {
    const vehicle = await getVehicleBySlug('audi-rs6-avant')
    expect(vehicle?.brand).toBe('Audi')
  })

  it('geçersiz slug undefined döner', async () => {
    expect(await getVehicleBySlug('yok-boyle-araclar')).toBeUndefined()
  })
})

describe('getFeaturedVehicles', () => {
  it('yalnızca featured işaretli araçları döner', async () => {
    for (const vehicle of await getFeaturedVehicles()) {
      expect(vehicle.featured).toBe(true)
    }
  })
})

describe('getVehicleImages', () => {
  it('çoklu görseli olan araç tüm listeyi döner', () => {
    const vehicle = makeVehicle({
      images: [
        { url: '/a.jpg', alt: 'a' },
        { url: '/b.jpg', alt: 'b' },
      ],
    })
    expect(getVehicleImages(vehicle)).toHaveLength(2)
  })

  it('çoklu görseli olmayan araçta tek anahtar görseli düşer', () => {
    const vehicle = makeVehicle()
    const images = getVehicleImages(vehicle)
    expect(images).toEqual([{ url: '/test.jpg', alt: 'BMW 5 Serisi' }])
  })
})

describe('getRelatedVehicles', () => {
  // Puanlama gerçek demo envanteri üzerinde doğrulanır:
  // BMW 7 Serisi (9.450.000, Sedan) için i4 M50 marka eşleşmesiyle +3 alır
  // (fiyat bandı dışında olsa da). Puan 2'li adayler: Tesla Model 3 (Sedan,
  // 2025), RS6 (band içi, 2024), C 200 (Sedan, 2024), Range Rover Sport ve
  // Cayenne (band içi); eşitlikte yıl 2025 > 2024, aynı yılda liste sırası.
  async function getBmw7() {
    const bmw7 = await getVehicleBySlug('bmw-7-serisi-740i')
    if (!bmw7) throw new Error('demo envanterinde bmw-7-serisi-740i yok')
    return bmw7
  }

  it('kendi slug\'unu dışlar', async () => {
    const bmw7 = await getBmw7()
    expect((await getRelatedVehicles(bmw7)).map((v) => v.slug)).not.toContain('bmw-7-serisi-740i')
  })

  it('limit sayısını geçirmez', async () => {
    const bmw7 = await getBmw7()
    expect(await getRelatedVehicles(bmw7, 2)).toHaveLength(2)
  })

  it('marka eşleşmesi öne geçer; kalanlar fiyat bandı + yeni yıl sırasıyla', async () => {
    const bmw7 = await getBmw7()
    const related = await getRelatedVehicles(bmw7)
    expect(related.map((v) => v.slug)).toEqual([
      'bmw-i4-m50',
      'tesla-model-3-long-range',
      'audi-rs6-avant',
    ])
  })
})

describe('filterVehicles', () => {
  const list = [
    makeVehicle({ slug: 'a', brand: 'BMW', model: '5 Serisi', price: 4000000, year: 2023, mileage: 10000, fuel: 'Benzin', body: 'Sedan', status: 'Satışta' }),
    makeVehicle({ slug: 'b', brand: 'BMW', model: '7 Serisi', price: 8000000, year: 2024, mileage: 20000, fuel: 'Dizel', body: 'Sedan', status: 'Rezerve' }),
    makeVehicle({ slug: 'c', brand: 'Audi', model: 'A6', price: 6000000, year: 2022, mileage: 30000, fuel: 'Benzin', body: 'SUV', status: 'Satışta' }),
  ]

  it('boş filtre tüm listeyi döner', () => {
    expect(filterVehicles(list, {})).toHaveLength(3)
  })

  it('marka filtreler', () => {
    expect(filterVehicles(list, { brand: 'BMW' }).map((v) => v.slug)).toEqual(['a', 'b'])
  })

  it('marka + model birlikte çalışır', () => {
    expect(filterVehicles(list, { brand: 'BMW', model: '7 Serisi' }).map((v) => v.slug)).toEqual(['b'])
  })

  it('fiyat aralığı uçlar dahil', () => {
    expect(filterVehicles(list, { priceMin: 4000000, priceMax: 6000000 }).map((v) => v.slug)).toEqual(['a', 'c'])
  })

  it('yıl ve km aralıkları', () => {
    expect(filterVehicles(list, { yearMin: 2023 }).map((v) => v.slug)).toEqual(['a', 'b'])
    expect(filterVehicles(list, { mileageMax: 20000 }).map((v) => v.slug)).toEqual(['a', 'b'])
  })

  it('enum alanları filtreler (yakıt, kasa, durum)', () => {
    expect(filterVehicles(list, { fuel: 'Dizel' }).map((v) => v.slug)).toEqual(['b'])
    expect(filterVehicles(list, { body: 'SUV' }).map((v) => v.slug)).toEqual(['c'])
    expect(filterVehicles(list, { status: 'Rezerve' }).map((v) => v.slug)).toEqual(['b'])
  })

  it('eşleşmeyen filtre boş sonuç döner', () => {
    expect(filterVehicles(list, { brand: 'Toyota' })).toEqual([])
  })

  it('geçersiz/uyumsuz kombinasyon güvenli (boş sonuç, hata yok)', () => {
    expect(filterVehicles(list, { brand: 'Audi', model: '5 Serisi' })).toEqual([])
  })
})

describe('sortVehicles', () => {
  const list = [
    makeVehicle({ slug: 'a', price: 5000000, mileage: 20000, year: 2022 }),
    makeVehicle({ slug: 'b', price: 3000000, mileage: 30000, year: 2024 }),
    makeVehicle({ slug: 'c', price: 4000000, mileage: 10000, year: 2023 }),
  ]

  it('price-asc fiyatı artan sıralar', () => {
    expect(sortVehicles(list, 'price-asc').map((v) => v.price)).toEqual([3000000, 4000000, 5000000])
  })

  it('price-desc fiyatı azalan sıralar', () => {
    expect(sortVehicles(list, 'price-desc').map((v) => v.price)).toEqual([5000000, 4000000, 3000000])
  })

  it('mileage-asc km artan sıralar', () => {
    expect(sortVehicles(list, 'mileage-asc').map((v) => v.mileage)).toEqual([10000, 20000, 30000])
  })

  it('year-desc yılı azalan sıralar', () => {
    expect(sortVehicles(list, 'year-desc').map((v) => v.year)).toEqual([2024, 2023, 2022])
  })

  it('boş sıralama anahtarı sırayı değiştirmez', () => {
    expect(sortVehicles(list, '').map((v) => v.slug)).toEqual(['a', 'b', 'c'])
  })

  it('girdi dizisini mutasyona uğratmaz', () => {
    const input = [...list]
    sortVehicles(input, 'price-asc')
    expect(input.map((v) => v.slug)).toEqual(['a', 'b', 'c'])
  })
})
