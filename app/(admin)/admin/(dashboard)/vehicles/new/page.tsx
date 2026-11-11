import Link from 'next/link'

import { VehicleForm } from '@/components/admin/vehicle-form'
import { requireAdminSession } from '@/lib/admin-auth'

export default async function AdminNewVehiclePage() {
  await requireAdminSession()

  return <div>
    <div className="section-head"><div><span className="eyebrow">Envanter</span><h2>Yeni araç</h2></div><Link href="/admin/vehicles" className="text-link">Listeye dön</Link></div>
    <VehicleForm mode="create"/>
    <p className="admin-muted">Slug otomatik üretilir (marka-model-donanım). Görsel/künye satırları &quot;url | açıklama&quot; ve &quot;etiket | değer&quot; biçimindedir.</p>
  </div>
}
