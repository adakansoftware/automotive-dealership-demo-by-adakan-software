import Link from 'next/link'
import { notFound } from 'next/navigation'
import { asc, eq } from 'drizzle-orm'

import { VehicleForm } from '@/components/admin/vehicle-form'
import { getDb, isDbConfigured } from '@/db'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  vehicleImages,
  vehicleSpecs,
  vehicles as vehiclesTable,
} from '@/drizzle/schema'

export default async function AdminEditVehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await requireAdminSession()

  if (!isDbConfigured()) {
    return <div className="admin-notice"><h2>Demo modu</h2><p>Araç düzenleme veritabanı gerektirir (<code>DATABASE_URL</code>).</p></div>
  }

  const { slug } = await params
  const db = getDb()
  const rows = await db.select().from(vehiclesTable).where(eq(vehiclesTable.slug, slug))
  const vehicle = rows[0]
  if (!vehicle) notFound()

  const images = await db
    .select()
    .from(vehicleImages)
    .where(eq(vehicleImages.vehicleId, vehicle.id))
    .orderBy(asc(vehicleImages.sortOrder))
  const specs = await db
    .select()
    .from(vehicleSpecs)
    .where(eq(vehicleSpecs.vehicleId, vehicle.id))
    .orderBy(asc(vehicleSpecs.sortOrder))

  return <div>
    <div className="section-head"><div><span className="eyebrow">Envanter</span><h2>{vehicle.brand} {vehicle.model}</h2></div><Link href="/admin/vehicles" className="text-link">Listeye dön</Link></div>
    <VehicleForm
      mode="edit"
      slug={vehicle.slug}
      initial={{
        brand: vehicle.brand,
        model: vehicle.model,
        trim: vehicle.trim,
        year: String(vehicle.year),
        price: String(vehicle.price),
        mileage: String(vehicle.mileage),
        fuel: vehicle.fuel,
        transmission: vehicle.transmission,
        body: vehicle.body,
        status: vehicle.status,
        condition: vehicle.condition,
        color: vehicle.color,
        featured: vehicle.featured,
        description: vehicle.description,
        images: images.map((image) => `${image.url} | ${image.alt}`.replace(/ \| $/, '')).join('\n'),
        specs: specs.map((spec) => `${spec.label} | ${spec.value}`).join('\n'),
      }}
    />
    <p className="admin-muted">Slug (<code>/{vehicle.slug}</code>) değişmez — URL ve SEO geçmişi korunur.</p>
  </div>
}
