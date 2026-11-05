import Link from 'next/link'
import { eq } from 'drizzle-orm'

import { getDb, isDbConfigured } from '@/db'
import { inquiries as inquiriesTable, vehicles as vehiclesTable } from '@/drizzle/schema'
import { requireAdminSession } from '@/lib/admin-auth'
import { VEHICLE_STATUSES, type VehicleStatus } from '@/types/vehicle'

const STATUS_LABELS: Record<VehicleStatus, string> = {
  'Satışta': 'Satışta',
  'Rezerve': 'Rezerve',
  'Satıldı': 'Satıldı',
}

export default async function AdminDashboard() {
  await requireAdminSession()

  if (!isDbConfigured()) {
    return <div className="admin-notice">
      <h2>Demo modu</h2>
      <p>Yönetim paneli veritabanı gerektirir. <code>DATABASE_URL</code> tanımladıktan sonra migration ve tohum betiğini çalıştırın:</p>
      <pre>{`corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:seed`}</pre>
      <p>Ayrıntılar: <code>docs/FUTURE_SYSTEM_DESIGN.md</code></p>
    </div>
  }

  const db = getDb()
  const vehicles = await db
    .select({ status: vehiclesTable.status })
    .from(vehiclesTable)
  const newInquiries = await db
    .select({ id: inquiriesTable.id })
    .from(inquiriesTable)
    .where(eq(inquiriesTable.status, 'new'))

  const counts: Record<VehicleStatus, number> = { 'Satışta': 0, 'Rezerve': 0, 'Satıldı': 0 }
  for (const vehicle of vehicles) counts[vehicle.status]++

  return <div>
    <div className="section-head"><div><span className="eyebrow">Yönetim</span><h2>Genel bakış</h2></div><Link href="/admin/vehicles/new" className="button primary">Yeni araç</Link></div>
    <div className="admin-stats">
      <div className="admin-stat"><span>Toplam araç</span><strong>{vehicles.length}</strong></div>
      {VEHICLE_STATUSES.map((status) => (
        <div key={status} className="admin-stat"><span>{STATUS_LABELS[status]}</span><strong>{counts[status]}</strong></div>
      ))}
      <div className="admin-stat"><span>Yeni sorgu</span><strong>{newInquiries.length}</strong></div>
    </div>
    <div className="admin-quick">
      <Link href="/admin/vehicles" className="button">Araçları yönet</Link>
      <Link href="/admin/inquiries" className="button">Sorgular</Link>
    </div>
  </div>
}
