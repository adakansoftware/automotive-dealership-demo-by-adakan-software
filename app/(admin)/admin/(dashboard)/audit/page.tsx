import { desc } from 'drizzle-orm'

import { getDb, isDbConfigured } from '@/db'
import { auditLog } from '@/drizzle/schema'
import { requireOwnerSession } from '@/lib/admin-auth'

export default async function AdminAuditPage() {
  await requireOwnerSession()

  if (!isDbConfigured()) {
    return <div className="admin-notice"><h2>Demo modu</h2><p>Denetim izi veritabanı gerektirir (<code>DATABASE_URL</code>).</p></div>
  }

  const db = getDb()
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(100)

  return <div>
    <div className="section-head"><div><span className="eyebrow">Güvenlik</span><h2>Denetim izi</h2></div></div>
    {rows.length === 0 ? <div className="admin-notice"><p>Kayıt yok. Mutating yönetim aksiyonları burada iz bırakır.</p></div> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Zaman</th><th>Aksiyon</th><th>Varlık</th><th>Değişiklik</th></tr></thead>
      <tbody>
        {rows.map((entry) => <tr key={entry.id}>
          <td>{new Date(entry.createdAt).toLocaleString('tr-TR')}</td>
          <td><code>{entry.action}</code></td>
          <td>{entry.entity}{entry.entityId ? ` · ${entry.entityId}` : ''}</td>
          <td className="admin-diff">{entry.diff ? <code>{JSON.stringify(entry.diff)}</code> : '—'}</td>
        </tr>)}
      </tbody>
    </table></div>}
  </div>
}
