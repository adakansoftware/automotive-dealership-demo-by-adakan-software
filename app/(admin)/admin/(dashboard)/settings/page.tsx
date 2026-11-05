import { eq } from 'drizzle-orm'

import { getDb, isDbConfigured } from '@/db'
import { siteConfigTable } from '@/drizzle/schema'
import { requireOwnerSession } from '@/lib/admin-auth'
import { getSiteConfig } from '@/lib/site-config'

import { SiteConfigForm } from './site-config-form'

export default async function AdminSettingsPage() {
  // Site ayarları yalnızca owner rolü (tasarım dokümanı §2.3).
  await requireOwnerSession()

  if (!isDbConfigured()) {
    return <div className="admin-notice"><h2>Demo modu</h2><p>Site ayarları veritabanı gerektirir (<code>DATABASE_URL</code>).</p></div>
  }

  const db = getDb()
  const rows = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, 'site'))
  const current = rows[0]?.value ?? (await getSiteConfig())
  const initialJson = JSON.stringify(current, null, 2)

  return <div>
    <div className="section-head"><div><span className="eyebrow">Yapılandırma</span><h2>Site ayarları</h2></div></div>
    <SiteConfigForm initialJson={initialJson}/>
    <p className="admin-muted">Buradaki değerler marka kimliğini, iletişim bilgilerini ve alan adını (metadataBase) besler. Gerçek müşteri bilgisi gelince bu formdan güncellenir.</p>
  </div>
}
