import { getDb, isDbConfigured } from '@/db'
import { auditLog } from '@/drizzle/schema'

export interface AuditEntry {
  actorId?: number
  action: string
  entity: string
  entityId?: string
  diff?: Record<string, { old?: unknown; new: unknown }>
  ipHash?: string
}

/**
 * Denetim izi yazımı. Her mutating admin aksiyonu çağırır; demo modunda
 * (DB yok) sessizce atlanır. Şifre/sır alanı asla `diff`'e konmaz.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  if (!isDbConfigured()) return
  const db = getDb()
  await db.insert(auditLog).values({
    actorId: entry.actorId ?? null,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    diff: entry.diff ?? null,
    ipHash: entry.ipHash ?? null,
  })
}
