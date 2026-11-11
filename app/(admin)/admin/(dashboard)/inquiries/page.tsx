import { desc } from 'drizzle-orm'

import { setInquiryStatus } from '@/app/(admin)/admin/actions'
import { getDb, isDbConfigured } from '@/db'
import { inquiries as inquiriesTable } from '@/drizzle/schema'
import { requireAdminSession } from '@/lib/admin-auth'

const INQUIRY_STATUS_OPTIONS = [
  { value: 'new', label: 'Yeni' },
  { value: 'contacted', label: 'Yanıtlandı' },
  { value: 'closed', label: 'Kapandı' },
] as const

export default async function AdminInquiriesPage() {
  await requireAdminSession()

  if (!isDbConfigured()) {
    return <div className="admin-notice"><h2>Demo modu</h2><p>Sorgu yönetimi veritabanı gerektirir (<code>DATABASE_URL</code>).</p></div>
  }

  const db = getDb()
  const rows = await db
    .select()
    .from(inquiriesTable)
    .orderBy(desc(inquiriesTable.createdAt))
    .limit(200)

  return <div>
    <div className="section-head"><div><span className="eyebrow">Müşteri</span><h2>Sorgular</h2></div></div>
    {rows.length === 0 ? <div className="admin-notice"><p>Henüz sorgu yok. İletişim formundan gelen sorgular burada listelenir.</p></div> : <div className="admin-inquiry-list">
      {rows.map((inquiry) => <article key={inquiry.id} className={`admin-inquiry${inquiry.status === 'new' ? ' is-new' : ''}`}>
        <header>
          <strong>{inquiry.name}</strong>
          <span className="admin-muted">{new Date(inquiry.createdAt).toLocaleString('tr-TR')}</span>
        </header>
        <div className="admin-inquiry-meta">
          <span>{inquiry.phone}</span>
          <span>{inquiry.email}</span>
          {inquiry.vehicleId && <span>Araç #{inquiry.vehicleId}</span>}
        </div>
        <p>{inquiry.message}</p>
        <form action={setInquiryStatus} className="admin-inline-form">
          <input type="hidden" name="id" value={inquiry.id}/>
          <select name="status" defaultValue={inquiry.status} aria-label="Sorgu durumu">
            {INQUIRY_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="submit" className="admin-button-small">Uygula</button>
        </form>
      </article>)}
    </div>}
  </div>
}
