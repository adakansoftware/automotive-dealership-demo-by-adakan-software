import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'
import { formatPrice, formatMileage } from '@/lib/format'

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) { return <Link href={`/araclar/${vehicle.slug}`} className="vehicle-card"><div className="vehicle-image"><img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} /><span className="card-arrow"><ArrowUpRight size={17}/></span></div><div className="vehicle-meta"><div><span className="eyebrow">{vehicle.brand}</span><h3>{vehicle.model}</h3><p>{vehicle.trim}</p></div><strong>{formatPrice(vehicle.price)}</strong></div><div className="vehicle-specs"><span>{vehicle.year}</span><span>{formatMileage(vehicle.mileage)}</span><span>{vehicle.transmission}</span></div></Link> }
