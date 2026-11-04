import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { InquiryBar } from '@/components/vehicles/inquiry-bar'
import { VehicleGallery } from '@/components/vehicles/vehicle-gallery'
import { getVehicles, getVehicleBySlug, getVehicleImages, getRelatedVehicles } from '@/lib/vehicles'
import { formatPrice, formatMileage } from '@/lib/format'

export function generateStaticParams() { return getVehicles().map((v) => ({ slug: v.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const vehicle = getVehicleBySlug(slug)
  if (!vehicle) return { title: 'Araç bulunamadı — Atelier Motors' }
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.trim} — Atelier Motors`
  return {
    title,
    description: vehicle.description,
    openGraph: {
      title,
      description: vehicle.description,
      images: [{ url: vehicle.image }],
    },
  }
}

export default async function VehicleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const vehicle = getVehicleBySlug(slug)
  if (!vehicle) notFound()
  const related = getRelatedVehicles(vehicle)
  const images = getVehicleImages(vehicle)
  const galleryTitle = `${vehicle.brand} ${vehicle.model} ${vehicle.trim}`
  const specs = ([['Yıl', vehicle.year], ['Kilometre', formatMileage(vehicle.mileage)], ['Yakıt', vehicle.fuel], ['Vites', vehicle.transmission], ['Kasa', vehicle.body], ['Renk', vehicle.color], ...(vehicle.condition ? [['Durumu', vehicle.condition] as const] : []), ['Fiyat', formatPrice(vehicle.price)]] as const).filter(([, value]) => value !== undefined && value !== '')
  return <main>
    <section className="detail-hero"><div className="detail-layout">
      <VehicleGallery images={images} title={galleryTitle}/>
      <div className="detail-info">
        <span className="eyebrow">{vehicle.brand} · {vehicle.year}</span>
        {vehicle.status && <span className={`status-badge${vehicle.status === 'Rezerve' ? ' reserved' : ''}`}>{vehicle.status}</span>}
        <h1>{vehicle.model}<br/><span>{vehicle.trim}</span></h1>
        <p>{vehicle.description}</p>
        <div className="detail-price">{formatPrice(vehicle.price)}</div>
        <InquiryBar vehicle={vehicle}/>
      </div>
    </div></section>
    <section className="section"><div className="section-head"><div><span className="eyebrow">Özellikler</span><h2>Araç künyesi</h2></div></div><div className="spec-table">{specs.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section>
    <section className="section dark"><div className="section-head"><div><span className="eyebrow">Benzer seçimler</span><h2>Size göre diğerleri</h2></div></div><div className="vehicle-grid">{related.map((v) => <VehicleCard key={v.slug} vehicle={v}/>)}</div></section>
  </main>
}
