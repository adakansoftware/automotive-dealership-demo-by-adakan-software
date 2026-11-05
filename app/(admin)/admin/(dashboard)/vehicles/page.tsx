import Link from 'next/link'

import { setVehicleStatus, deleteVehicle } from '@/app/(admin)/admin/actions'
import { ConfirmSubmit } from '@/components/admin/confirm-submit'
import { getDb, isDbConfigured } from '@/db'
import { vehicles as vehiclesTable } from '@/drizzle/schema'
import { formatPrice } from '@/lib/format'
import { requireAdminSession } from '@/lib/admin-auth'
import { VEHICLE_STATUSES } from '@/types/vehicle'

export default async function AdminVehiclesPage() {
  await requireAdminSession()

  if (!isDbConfigured()) {
    return <div className="admin-notice"><h2>Demo modu</h2><p>Araç yönetimi veritabanı gerektirir (<code>DATABASE_URL</code>).</p></div>
  }

  const db = getDb()
  const rows = await db.select().from(vehiclesTable).orderBy(vehiclesTable.id)

  return <div>
    <div className="section-head"><div><span className="eyebrow">Envanter</span><h2>Araçlar</h2></div><Link href="/admin/vehicles/new" className="button primary">Yeni araç</Link></div>
    {rows.length === 0 ? <div className="admin-notice"><p>Henüz araç yok. Yeni araç ekleyerek başlayın.</p></div> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Araç</th><th>Yıl</th><th>Fiyat</th><th>Durum</th><th>Öne çıkan</th><th></th></tr></thead>
      <tbody>
        {rows.map((vehicle) => <tr key={vehicle.id}>
          <td>
            <strong>{vehicle.brand} {vehicle.model}</strong>
            <span className="admin-muted">{vehicle.trim || '—'} · /{vehicle.slug}</span>
          </td>
          <td>{vehicle.year}</td>
          <td>{formatPrice(vehicle.price)}</td>
          <td>
            <form action={setVehicleStatus} className="admin-inline-form">
              <input type="hidden" name="slug" value={vehicle.slug}/>
              <select name="status" defaultValue={vehicle.status} aria-label="Araç durumu">
                {VEHICLE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <button type="submit" className="admin-button-small">Uygula</button>
            </form>
          </td>
          <td>{vehicle.featured ? '★' : '—'}</td>
          <td>
            <div className="admin-row-actions">
              <Link href={`/admin/vehicles/${vehicle.slug}/edit`} className="admin-button-small">Düzenle</Link>
              <Link href={`/araclar/${vehicle.slug}`} className="admin-button-small" target="_blank">Gör</Link>
              <form action={deleteVehicle}>
                <input type="hidden" name="slug" value={vehicle.slug}/>
                <ConfirmSubmit label="Sil" confirmText={`"${vehicle.brand} ${vehicle.model}" kalıcı olarak silinsin mi?`}/>
              </form>
            </div>
          </td>
        </tr>)}
      </tbody>
    </table></div>}
  </div>
}
