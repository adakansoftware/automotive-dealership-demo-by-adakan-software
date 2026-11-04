import { vehicles } from '@/data/vehicles'
import type { Vehicle, VehicleImage } from '@/types/vehicle'

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

/** Tüm araçlar. Sayfalar `data/vehicles` dizisine doğrudan erişmemeli. */
export function getVehicles(): Vehicle[] {
  return vehicles
}

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return vehicles.find((vehicle) => vehicle.slug === slug)
}

export function getFeaturedVehicles(): Vehicle[] {
  return vehicles.filter((vehicle) => vehicle.featured)
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
export function getRelatedVehicles(vehicle: Vehicle, limit = 3): Vehicle[] {
  return vehicles
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
