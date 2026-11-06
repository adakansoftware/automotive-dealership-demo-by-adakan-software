import { cache } from 'react'

import { vehicles as demoVehicles } from '@/data/vehicles'
import { getDb, isDbConfigured } from '@/db'
import {
  vehicleImages as vehicleImagesTable,
  vehicleSpecs as vehicleSpecsTable,
  vehicles as vehiclesTable,
} from '@/drizzle/schema'
import type { Vehicle, VehicleImage, VehicleSpec } from '@/types/vehicle'

export interface VehicleFilters {
  brand?: string
  model?: string
  body?: string
  fuel?: string
  transmission?: string
  status?: string
  priceMin?: number
  priceMax?: number
  yearMin?: number
  yearMax?: number
  mileageMin?: number
  mileageMax?: number
}

export type VehicleSortKey =
  | 'price-asc'
  | 'price-desc'
  | 'mileage-asc'
  | 'year-desc'

/**
 * Tüm araçlar. `DATABASE_URL` tanımlıysa PostgreSQL'den, yoksa demo veriden
 * okur (build/test ortamı DB gerektirmez). `cache` sayesinde aynı istek
 * içinde tek sorgu. Sayfalar `data/vehicles` dizisine doğrudan erişmemeli.
 */
export const getVehicles = cache(async (): Promise<Vehicle[]> => {
  if (!isDbConfigured()) return demoVehicles

  const db = getDb()
  const rows = await db.select().from(vehiclesTable).orderBy(vehiclesTable.id)
  const imageRows = await db
    .select()
    .from(vehicleImagesTable)
    .orderBy(vehicleImagesTable.sortOrder)

  const imagesByVehicle = new Map<number, typeof imageRows>()
  for (const image of imageRows) {
    const list = imagesByVehicle.get(image.vehicleId) ?? []
    list.push(image)
    imagesByVehicle.set(image.vehicleId, list)
  }

  const specRows = await db.select().from(vehicleSpecsTable).orderBy(vehicleSpecsTable.sortOrder)
  const specsByVehicle = new Map<number, VehicleSpec[]>()
  for (const spec of specRows) {
    const list = specsByVehicle.get(spec.vehicleId) ?? []
    list.push({ label: spec.label, value: spec.value })
    specsByVehicle.set(spec.vehicleId, list)
  }

  return rows.map((row) => {
    const images = imagesByVehicle.get(row.id) ?? []
    const specs = specsByVehicle.get(row.id) ?? []
    // Anahtar görsel: isKey işaretli satır, yoksa ilk sıradaki (getVehicleImages mantığı).
    const keyImage = images.find((image) => image.isKey) ?? images[0]
    return {
      slug: row.slug,
      brand: row.brand,
      model: row.model,
      trim: row.trim,
      year: row.year,
      price: Number(row.price),
      mileage: row.mileage,
      fuel: row.fuel,
      transmission: row.transmission,
      body: row.body,
      color: row.color,
      image: keyImage?.url ?? '',
      images: images.length
        ? images.map((image) => ({ url: image.url, alt: image.alt || undefined }))
        : undefined,
      specs: specs.length ? specs : undefined,
      featured: row.featured,
      status: row.status,
      condition: row.condition,
      description: row.description,
    } satisfies Vehicle
  })
})

export async function getVehicleBySlug(slug: string): Promise<Vehicle | undefined> {
  const all = await getVehicles()
  return all.find((vehicle) => vehicle.slug === slug)
}

export async function getFeaturedVehicles(): Promise<Vehicle[]> {
  const all = await getVehicles()
  return all.filter((vehicle) => vehicle.featured)
}

/** Aracın tam görsel listesi; çoklu görsel yoksa tek anahtar görsel. */
export function getVehicleImages(vehicle: Vehicle): VehicleImage[] {
  if (vehicle.images?.length) return vehicle.images
  return [{ url: vehicle.image, alt: `${vehicle.brand} ${vehicle.model}` }]
}

/**
 * Benzer araçlar — açıklanabilir puanlama:
 *   aynı marka +3, aynı kasa +2, fiyat ±%20 bandı içinde +2.
 * Eşitlikte daha yeni yıl öne geçer.
 */
export async function getRelatedVehicles(vehicle: Vehicle, limit = 3): Promise<Vehicle[]> {
  const all = await getVehicles()
  return all
    .filter((candidate) => candidate.slug !== vehicle.slug)
    .map((candidate) => {
      let score = 0
      if (candidate.brand === vehicle.brand) score += 3
      if (candidate.body === vehicle.body) score += 2
      if (Math.abs(candidate.price - vehicle.price) / vehicle.price <= 0.2) score += 2
      return { candidate, score }
    })
    .sort((a, b) => b.score - a.score || b.candidate.year - a.candidate.year)
    .slice(0, limit)
    .map((entry) => entry.candidate)
}

export function filterVehicles(list: Vehicle[], filters: VehicleFilters): Vehicle[] {
  return list.filter(
    (vehicle) =>
      (!filters.brand || vehicle.brand === filters.brand) &&
      (!filters.model || vehicle.model === filters.model) &&
      (!filters.body || vehicle.body === filters.body) &&
      (!filters.fuel || vehicle.fuel === filters.fuel) &&
      (!filters.transmission || vehicle.transmission === filters.transmission) &&
      (!filters.status || vehicle.status === filters.status) &&
      (filters.priceMin === undefined || vehicle.price >= filters.priceMin) &&
      (filters.priceMax === undefined || vehicle.price <= filters.priceMax) &&
      (filters.yearMin === undefined || vehicle.year >= filters.yearMin) &&
      (filters.yearMax === undefined || vehicle.year <= filters.yearMax) &&
      (filters.mileageMin === undefined || vehicle.mileage >= filters.mileageMin) &&
      (filters.mileageMax === undefined || vehicle.mileage <= filters.mileageMax),
  )
}

export function sortVehicles(list: Vehicle[], sort: VehicleSortKey | ''): Vehicle[] {
  const sorted = [...list]
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'mileage-asc':
      sorted.sort((a, b) => a.mileage - b.mileage)
      break
    case 'year-desc':
      sorted.sort((a, b) => b.year - a.year)
      break
  }
  return sorted
}
