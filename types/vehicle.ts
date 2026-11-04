export const VEHICLE_STATUSES = ['Satışta', 'Rezerve', 'Satıldı'] as const
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number]

export const VEHICLE_CONDITIONS = ['Sıfır', 'İkinci El'] as const
export type VehicleCondition = (typeof VEHICLE_CONDITIONS)[number]

export const VEHICLE_FUEL_TYPES = ['Benzin', 'Dizel', 'Hibrit', 'Elektrik'] as const
export type VehicleFuelType = (typeof VEHICLE_FUEL_TYPES)[number]

export const VEHICLE_TRANSMISSIONS = ['Otomatik', 'Manuel'] as const
export type VehicleTransmission = (typeof VEHICLE_TRANSMISSIONS)[number]

export const VEHICLE_BODY_TYPES = [
  'Sedan',
  'Coupe',
  'SUV',
  'Station Wagon',
  'Hatchback',
] as const
export type VehicleBodyType = (typeof VEHICLE_BODY_TYPES)[number]

export interface Vehicle {
  slug: string
  brand: string
  model: string
  trim: string
  year: number
  price: number
  mileage: number
  fuel: VehicleFuelType
  transmission: VehicleTransmission
  body: VehicleBodyType
  color: string
  image: string
  featured?: boolean
  status?: VehicleStatus
  condition?: VehicleCondition
  description: string
}
