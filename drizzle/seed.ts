import { config } from 'dotenv'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { adminUsers, siteConfigTable, vehicleImages, vehicleSpecs, vehicles } from './schema'
import { vehicles as demoVehicles } from '../data/vehicles'
import { siteConfig } from '../data/site-config'

// .env.local öncelikli (README akışı), yoksa .env
config({ path: '.env.local' })
config()

/**
 * Tohum betiği — demo envanterini ve site yapılandırmasını veritabanına yükler.
 * Tek seferlik çalıştırılır: `corepack pnpm db:seed`
 * Tekrar çalıştırmada günceller (upsert) — idempotent.
 */
async function seed() {
  console.log('Tohum başlıyor…')

  const db = getDb()

  await db.transaction(async (tx) => {
    // Demo araçlar
    for (const vehicle of demoVehicles) {
      const inserted = await tx
        .insert(vehicles)
        .values({
          slug: vehicle.slug,
          brand: vehicle.brand,
          model: vehicle.model,
          trim: vehicle.trim,
          year: vehicle.year,
          price: vehicle.price,
          mileage: vehicle.mileage,
          fuel: vehicle.fuel,
          transmission: vehicle.transmission,
          body: vehicle.body,
          color: vehicle.color,
          status: vehicle.status ?? 'Satışta',
          condition: vehicle.condition ?? 'İkinci El',
          featured: vehicle.featured ?? false,
          description: vehicle.description,
        })
        .onConflictDoUpdate({
          target: vehicles.slug,
          set: {
            brand: vehicle.brand,
            model: vehicle.model,
            trim: vehicle.trim,
            year: vehicle.year,
            price: vehicle.price,
            mileage: vehicle.mileage,
            fuel: vehicle.fuel,
            transmission: vehicle.transmission,
            body: vehicle.body,
            color: vehicle.color,
            status: vehicle.status ?? 'Satışta',
            condition: vehicle.condition ?? 'İkinci El',
            featured: vehicle.featured ?? false,
            description: vehicle.description,
          },
        })
        .returning({ id: vehicles.id })

      const vehicleId = inserted[0]!.id

      // Araç görselleri eski kayıttan kalmış olabilir — temizle, yeniden ekle.
      await tx.delete(vehicleImages).where(eq(vehicleImages.vehicleId, vehicleId))

      const images = vehicle.images ?? [{ url: vehicle.image, alt: '' }]
      await tx.insert(vehicleImages).values(
        images.map((image, index) => ({
          vehicleId,
          url: image.url,
          alt: image.alt ?? '',
          sortOrder: index,
          isKey: index === 0,
        })),
      )

      // Künye satırları da görseller gibi temizlenip yeniden yazılır.
      await tx.delete(vehicleSpecs).where(eq(vehicleSpecs.vehicleId, vehicleId))
      if (vehicle.specs?.length) {
        await tx.insert(vehicleSpecs).values(
          vehicle.specs.map((spec, index) => ({
            vehicleId,
            label: spec.label,
            value: spec.value,
            sortOrder: index,
          })),
        )
      }
    }

    // Site yapılandırması
    await tx
      .insert(siteConfigTable)
      .values({ key: 'site', value: siteConfig })
      .onConflictDoUpdate({ target: siteConfigTable.key, set: { value: siteConfig } })

    // Admin kullanıcısı — şifre ADMIN_INITIAL_PASSWORD ile ayarlanır (yoksa atlanır).
    const password = process.env.ADMIN_INITIAL_PASSWORD
    if (password) {
      const { hashPassword } = await import('../lib/auth-password')
      await tx
        .insert(adminUsers)
        .values({
          email: process.env.ADMIN_INITIAL_EMAIL ?? 'admin@ateliermotors.com',
          passwordHash: await hashPassword(password),
          name: 'Yönetici',
          role: 'owner',
        })
        .onConflictDoNothing({ target: adminUsers.email })
    }
  })

  console.log(`Tohum tamam: ${demoVehicles.length} araç + site yapılandırması.`)
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
