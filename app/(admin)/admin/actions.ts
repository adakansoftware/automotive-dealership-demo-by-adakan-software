'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { auth } from '@/auth'
import { getDb, isDbConfigured } from '@/db'
import {
  inquiries as inquiriesTable,
  siteConfigTable,
  vehicleImages,
  vehicleSpecs,
  vehicles as vehiclesTable,
} from '@/drizzle/schema'
import { writeAudit } from '@/lib/audit'
import {
  VEHICLE_BODY_TYPES,
  VEHICLE_CONDITIONS,
  VEHICLE_FUEL_TYPES,
  VEHICLE_STATUSES,
  VEHICLE_TRANSMISSIONS,
} from '@/types/vehicle'

export interface VehicleFormResult {
  error: string
}

export interface SiteConfigFormResult {
  error: string
}

type AdminUser = { id: string; email: string; role: 'owner' | 'editor' }

async function requireAdmin(): Promise<AdminUser> {
  const session = await auth()
  if (!session?.user) throw new Error('Bu işlem için yönetici girişi gerekli.')
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    role: session.user.role,
  }
}

function requireDb() {
  if (!isDbConfigured()) {
    throw new Error('Bu işlem veritabanı gerektirir — DATABASE_URL tanımlı değil (demo modu).')
  }
  return getDb()
}

function revalidateVehiclePaths(slug?: string) {
  revalidatePath('/')
  revalidatePath('/araclar')
  revalidatePath('/admin/vehicles')
  if (slug) revalidatePath(`/araclar/${slug}`)
}

const TR_MAP: Record<string, string> = {
  ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u',
  Ç: 'c', Ğ: 'g', I: 'i', Ö: 'o', Ş: 's', Ü: 'u',
}

function slugify(input: string): string {
  return input
    .split('')
    .map((ch) => TR_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface ParsedVehicle {
  brand: string
  model: string
  trim: string
  year: number
  price: number
  mileage: number
  fuel: string
  transmission: string
  body: string
  color: string
  status: string
  condition: string
  featured: boolean
  description: string
  images: { url: string; alt: string }[]
  specs: { label: string; value: string }[]
}

function parseVehicleForm(formData: FormData): { data?: ParsedVehicle; error?: string } {
  const get = (key: string) => String(formData.get(key) ?? '').trim()

  const brand = get('brand')
  const model = get('model')
  if (!brand || !model) return { error: 'Marka ve model zorunludur.' }

  const year = Number(get('year'))
  const price = Number(get('price'))
  const mileage = Number(get('mileage'))
  if (!Number.isInteger(year) || year < 1980 || year > 2100) return { error: 'Geçerli bir yıl girin (1980–2100).' }
  if (!Number.isInteger(price) || price < 0) return { error: 'Geçerli bir fiyat girin (TL).' }
  if (!Number.isInteger(mileage) || mileage < 0) return { error: 'Geçerli bir kilometre girin.' }

  const fuel = get('fuel')
  const transmission = get('transmission')
  const body = get('body')
  const status = get('status')
  const condition = get('condition')
  if (!VEHICLE_FUEL_TYPES.includes(fuel as never)) return { error: 'Geçersiz yakıt türü.' }
  if (!VEHICLE_TRANSMISSIONS.includes(transmission as never)) return { error: 'Geçersiz vites türü.' }
  if (!VEHICLE_BODY_TYPES.includes(body as never)) return { error: 'Geçersiz kasa türü.' }
  if (!VEHICLE_STATUSES.includes(status as never)) return { error: 'Geçersiz durum.' }
  if (!VEHICLE_CONDITIONS.includes(condition as never)) return { error: 'Geçersiz araç durumu.' }

  const images = formData.get('images')
    ? String(formData.get('images'))
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [url, ...altParts] = line.split('|')
          return { url: url.trim(), alt: altParts.join('|').trim() }
        })
    : []
  if (images.some((image) => !image.url)) return { error: 'Görsel satırları "url | açıklama" biçiminde olmalı.' }

  const specs = formData.get('specs')
    ? String(formData.get('specs'))
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, ...valueParts] = line.split('|')
          return { label: label.trim(), value: valueParts.join('|').trim() }
        })
    : []
  if (specs.some((spec) => !spec.label || !spec.value)) {
    return { error: 'Künye satırları "etiket | değer" biçiminde olmalı.' }
  }

  return {
    data: {
      brand,
      model,
      trim: get('trim'),
      year,
      price,
      mileage,
      fuel,
      transmission,
      body,
      color: get('color'),
      status,
      condition,
      featured: formData.get('featured') === 'on',
      description: get('description'),
      images,
      specs,
    },
  }
}

async function uniqueSlug(base: string): Promise<string> {
  const db = requireDb()
  let slug = base
  let counter = 2
  // Benzersiz slug bulunana kadar sayaç ekle (bmw-5-serisi, bmw-5-serisi-2, …).
  for (;;) {
    const existing = await db
      .select({ id: vehiclesTable.id })
      .from(vehiclesTable)
      .where(eq(vehiclesTable.slug, slug))
    if (existing.length === 0) return slug
    slug = `${base}-${counter++}`
  }
}

export async function createVehicle(
  _prev: VehicleFormResult,
  formData: FormData,
): Promise<VehicleFormResult> {
  try {
    const admin = await requireAdmin()
    const db = requireDb()
    const parsed = parseVehicleForm(formData)
    if (!parsed.data) return { error: parsed.error ?? 'Geçersiz form verisi.' }
    const vehicle = parsed.data

    const slug = await uniqueSlug(slugify(`${vehicle.brand} ${vehicle.model} ${vehicle.trim}`))

    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(vehiclesTable)
        .values({
          slug,
          brand: vehicle.brand,
          model: vehicle.model,
          trim: vehicle.trim,
          year: vehicle.year,
          price: vehicle.price,
          mileage: vehicle.mileage,
          fuel: vehicle.fuel as never,
          transmission: vehicle.transmission as never,
          body: vehicle.body as never,
          color: vehicle.color,
          status: vehicle.status as never,
          condition: vehicle.condition as never,
          featured: vehicle.featured,
          description: vehicle.description,
        })
        .returning({ id: vehiclesTable.id })
      const vehicleId = inserted[0]!.id

      if (vehicle.images.length) {
        await tx.insert(vehicleImages).values(
          vehicle.images.map((image, index) => ({
            vehicleId,
            url: image.url,
            alt: image.alt,
            sortOrder: index,
            isKey: index === 0,
          })),
        )
      }
      if (vehicle.specs.length) {
        await tx.insert(vehicleSpecs).values(
          vehicle.specs.map((spec, index) => ({
            vehicleId,
            label: spec.label,
            value: spec.value,
            sortOrder: index,
          })),
        )
      }
    })

    await writeAudit({
      actorId: Number(admin.id),
      action: 'vehicle.create',
      entity: 'vehicle',
      entityId: slug,
    })
    revalidateVehiclePaths(slug)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Araç kaydedilemedi.' }
  }
  redirect('/admin/vehicles')
}

export async function updateVehicle(
  _prev: VehicleFormResult,
  formData: FormData,
): Promise<VehicleFormResult> {
  try {
    const admin = await requireAdmin()
    const db = requireDb()
    const slug = String(formData.get('slug') ?? '').trim()
    if (!slug) return { error: 'Araç bulunamadı.' }

    const existingRows = await db.select().from(vehiclesTable).where(eq(vehiclesTable.slug, slug))
    const existing = existingRows[0]
    if (!existing) return { error: 'Araç bulunamadı.' }

    const parsed = parseVehicleForm(formData)
    if (!parsed.data) return { error: parsed.error ?? 'Geçersiz form verisi.' }
    const vehicle = parsed.data

    const diff: Record<string, { old: unknown; new: unknown }> = {}
    const nextValues = {
      brand: vehicle.brand,
      model: vehicle.model,
      trim: vehicle.trim,
      year: vehicle.year,
      price: vehicle.price,
      mileage: vehicle.mileage,
      color: vehicle.color,
      featured: vehicle.featured,
      description: vehicle.description,
    }
    for (const [key, value] of Object.entries(nextValues)) {
      if (existing[key as keyof typeof existing] !== value) {
        diff[key] = { old: existing[key as keyof typeof existing], new: value }
      }
    }
    if (existing.fuel !== vehicle.fuel) diff.fuel = { old: existing.fuel, new: vehicle.fuel }
    if (existing.transmission !== vehicle.transmission) {
      diff.transmission = { old: existing.transmission, new: vehicle.transmission }
    }
    if (existing.body !== vehicle.body) diff.body = { old: existing.body, new: vehicle.body }
    if (existing.status !== vehicle.status) diff.status = { old: existing.status, new: vehicle.status }
    if (existing.condition !== vehicle.condition) {
      diff.condition = { old: existing.condition, new: vehicle.condition }
    }

    await db.transaction(async (tx) => {
      await tx
        .update(vehiclesTable)
        .set({
          brand: vehicle.brand,
          model: vehicle.model,
          trim: vehicle.trim,
          year: vehicle.year,
          price: vehicle.price,
          mileage: vehicle.mileage,
          fuel: vehicle.fuel as never,
          transmission: vehicle.transmission as never,
          body: vehicle.body as never,
          color: vehicle.color,
          status: vehicle.status as never,
          condition: vehicle.condition as never,
          featured: vehicle.featured,
          description: vehicle.description,
          updatedAt: new Date(),
        })
        .where(eq(vehiclesTable.slug, slug))

      // Görseller ve künye satırları tazedelenir (sıra korunur).
      await tx.delete(vehicleImages).where(eq(vehicleImages.vehicleId, existing.id))
      await tx.delete(vehicleSpecs).where(eq(vehicleSpecs.vehicleId, existing.id))
      if (vehicle.images.length) {
        await tx.insert(vehicleImages).values(
          vehicle.images.map((image, index) => ({
            vehicleId: existing.id,
            url: image.url,
            alt: image.alt,
            sortOrder: index,
            isKey: index === 0,
          })),
        )
      }
      if (vehicle.specs.length) {
        await tx.insert(vehicleSpecs).values(
          vehicle.specs.map((spec, index) => ({
            vehicleId: existing.id,
            label: spec.label,
            value: spec.value,
            sortOrder: index,
          })),
        )
      }
    })

    await writeAudit({
      actorId: Number(admin.id),
      action: 'vehicle.update',
      entity: 'vehicle',
      entityId: slug,
      diff: Object.keys(diff).length ? diff : undefined,
    })
    revalidateVehiclePaths(slug)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Araç güncellenemedi.' }
  }
  redirect('/admin/vehicles')
}

export async function setVehicleStatus(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const db = requireDb()
  const slug = String(formData.get('slug') ?? '').trim()
  const status = String(formData.get('status') ?? '').trim()
  if (!VEHICLE_STATUSES.includes(status as never)) throw new Error('Geçersiz durum.')

  const existingRows = await db
    .select({ id: vehiclesTable.id, status: vehiclesTable.status })
    .from(vehiclesTable)
    .where(eq(vehiclesTable.slug, slug))
  const existing = existingRows[0]
  if (!existing) throw new Error('Araç bulunamadı.')
  if (existing.status === status) return

  await db
    .update(vehiclesTable)
    .set({ status: status as never, updatedAt: new Date() })
    .where(eq(vehiclesTable.slug, slug))
  await writeAudit({
    actorId: Number(admin.id),
    action: 'vehicle.status',
    entity: 'vehicle',
    entityId: slug,
    diff: { status: { old: existing.status, new: status } },
  })
  revalidateVehiclePaths(slug)
}

export async function deleteVehicle(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const db = requireDb()
  const slug = String(formData.get('slug') ?? '').trim()

  const existingRows = await db
    .select({ id: vehiclesTable.id })
    .from(vehiclesTable)
    .where(eq(vehiclesTable.slug, slug))
  if (!existingRows[0]) throw new Error('Araç bulunamadı.')

  await db.delete(vehiclesTable).where(eq(vehiclesTable.slug, slug))
  await writeAudit({
    actorId: Number(admin.id),
    action: 'vehicle.delete',
    entity: 'vehicle',
    entityId: slug,
  })
  revalidateVehiclePaths(slug)
}

export async function setInquiryStatus(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const db = requireDb()
  const id = Number(formData.get('id'))
  const status = String(formData.get('status') ?? '').trim()
  if (!Number.isInteger(id)) throw new Error('Geçersiz sorgu.')
  if (!['new', 'contacted', 'closed'].includes(status)) throw new Error('Geçersiz durum.')

  await db
    .update(inquiriesTable)
    .set({ status: status as never })
    .where(eq(inquiriesTable.id, id))
  await writeAudit({
    actorId: Number(admin.id),
    action: 'inquiry.status',
    entity: 'inquiry',
    entityId: String(id),
    diff: { status: { new: status } },
  })
  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
}

export async function updateSiteConfig(
  _prev: SiteConfigFormResult,
  formData: FormData,
): Promise<SiteConfigFormResult> {
  try {
    const admin = await requireAdmin()
    if (admin.role !== 'owner') return { error: 'Site ayarları yalnızca owner rolü tarafından değiştirilebilir.' }
    const db = requireDb()

    let value: unknown
    try {
      value = JSON.parse(String(formData.get('config') ?? ''))
    } catch {
      return { error: 'Geçerli bir JSON girin.' }
    }
    if (typeof value !== 'object' || value === null) return { error: 'Yapılandırma bir nesne olmalı.' }

    await db
      .insert(siteConfigTable)
      .values({ key: 'site', value })
      .onConflictDoUpdate({
        target: siteConfigTable.key,
        set: { value, updatedAt: new Date() },
      })
    await writeAudit({
      actorId: Number(admin.id),
      action: 'site_config.update',
      entity: 'site_config',
      entityId: 'site',
    })
    revalidatePath('/', 'layout')
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Ayarlar kaydedilemedi.' }
  }
  return { error: '' }
}
