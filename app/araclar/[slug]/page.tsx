import { notFound } from 'next/navigation'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { InquiryBar } from '@/components/vehicles/inquiry-bar'
import { getVehicles, getVehicleBySlug, getRelatedVehicles } from '@/lib/vehicles'
import { formatPrice, formatMileage } from '@/lib/format'

export function generateStaticParams() { return getVehicles().map((v) => ({ slug: v.slug })) }

export default async function VehicleDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const vehicle = getVehicleBySlug(slug); if (!vehicle) notFound(); const related = getRelatedVehicles(vehicle); return <main><section className="detail-hero"><div className="detail-layout"><div className="gallery-main"><img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model} ${vehicle.trim}`}/></div><div className="detail-info"><span className="eyebrow">{vehicle.brand} · {vehicle.year}</span><h1>{vehicle.model}<br/><span>{vehicle.trim}</span></h1><p>{vehicle.description}</p><div className="detail-price">{formatPrice(vehicle.price)}</div><InquiryBar vehicle={vehicle}/></div></div><div className="detail-specs">{([['Yıl', vehicle.year], ['Kilometre', formatMileage(vehicle.mileage)], ['Yakıt', vehicle.fuel], ['Vites', vehicle.transmission]] as const).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section><section className="section dark"><div className="section-head"><div><span className="eyebrow">Benzer seçimler</span><h2>Size göre diğerleri</h2></div></div><div className="vehicle-grid">{related.map((v) => <VehicleCard key={v.slug} vehicle={v}/>)}</div></section></main> }
