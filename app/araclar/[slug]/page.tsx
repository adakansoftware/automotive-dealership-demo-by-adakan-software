import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { InquiryBar } from '@/components/vehicles/inquiry-bar'
import { VehicleGallery } from '@/components/vehicles/vehicle-gallery'
import { getVehicles, getVehicleBySlug, getVehicleImages, getRelatedVehicles } from '@/lib/vehicles'
import { formatPrice, formatMileage } from '@/lib/format'
import { getSiteConfig } from '@/lib/site-config'
import type { VehicleStatus } from '@/types/vehicle'

const AVAILABILITY: Record<VehicleStatus, string> = {
  'Satışta': 'https://schema.org/InStock',
  'Rezerve': 'https://schema.org/LimitedAvailability',
  'Satıldı': 'https://schema.org/SoldOut',
}

export async function generateStaticParams() {
  const vehicles = await getVehicles()
  return vehicles.map((v) => ({ slug: v.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const vehicle = await getVehicleBySlug(slug)
  if (!vehicle) return { title: 'Araç bulunamadı' }
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.trim}`
  return {
    title,
    description: vehicle.description,
    alternates: { canonical: `/araclar/${slug}` },
    openGraph: {
      title,
      description: vehicle.description,
      url: `/araclar/${slug}`,
      images: [{ url: vehicle.image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: vehicle.description,
      images: [vehicle.image],
    },
  }
}

export default async function VehicleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const vehicle = await getVehicleBySlug(slug)
  if (!vehicle) notFound()
  const related = await getRelatedVehicles(vehicle)
  const images = getVehicleImages(vehicle)
  const siteConfig = await getSiteConfig()
  const galleryTitle = `${vehicle.brand} ${vehicle.model} ${vehicle.trim}`
  const specs = ([['Yıl', vehicle.year], ['Kilometre', formatMileage(vehicle.mileage)], ['Yakıt', vehicle.fuel], ['Vites', vehicle.transmission], ['Kasa', vehicle.body], ['Renk', vehicle.color], ...(vehicle.condition ? [['Durumu', vehicle.condition] as const] : []), ['Fiyat', formatPrice(vehicle.price)]] as const).filter(([, value]) => value !== undefined && value !== '')
  const absoluteImage = (url: string) => url.startsWith('http') ? url : `${siteConfig.url}${url}`
  const vehicleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: galleryTitle,
    brand: { '@type': 'Brand', name: vehicle.brand },
    model: vehicle.model,
    productionDate: String(vehicle.year),
    color: vehicle.color,
    image: absoluteImage(vehicle.image),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage, unitCode: 'KMT' },
    ...(vehicle.condition ? { itemCondition: vehicle.condition === 'Sıfır' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition' } : {}),
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'TRY',
      url: `${siteConfig.url}/araclar/${vehicle.slug}`,
      ...(vehicle.status ? { availability: AVAILABILITY[vehicle.status] } : {}),
    },
  }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd) }}/><main>
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
  </main></>
}
