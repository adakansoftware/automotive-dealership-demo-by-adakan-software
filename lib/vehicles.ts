import { vehicles } from '@/data/vehicles'
import type { Vehicle } from '@/types/vehicle'

export interface VehicleFilters {
  brand?: string
  body?: string
  fuel?: string
}

export type VehicleSortKey = 'price-asc' | 'price-desc' | 'year-desc'

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
      (!filters.body || vehicle.body === filters.body) &&
      (!filters.fuel || vehicle.fuel === filters.fuel),
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
    case 'year-desc':
      sorted.sort((a, b) => b.year - a.year)
      break
  }
  return sorted
}
