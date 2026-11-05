import { createHash } from 'node:crypto'
import { sql } from 'drizzle-orm'

import { getDb, isDbConfigured } from '@/db'

export interface RateLimitOptions {
  /** Pencere süresi (milisaniye). */
  windowMs: number
  /** Pencere başına izin verilen istek sayısı. */
  max: number
}

/**
 * Kalıcı rate limit. DB yapılandırılmışsa `rate_limits` tablosunda atomik
 * upsert ile sayar (serverless/multi-instance güvenli); değilse süreç
 * belleğinde demo sayar. Anahtar ham IP değil, tuzlanmış özettir (KVKK).
 */
export async function checkRateLimit(rawKey: string, options: RateLimitOptions): Promise<boolean> {
  const key = hashIdentifier(rawKey)
  const windowSeconds = Math.ceil(options.windowMs / 1000)

  if (!isDbConfigured()) {
    return checkInMemory(key, options)
  }

  const db = getDb()
  const rows = await db.execute<{ count: number }>(sql`
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
      reset_at = CASE WHEN rate_limits.reset_at < now()
        THEN now() + make_interval(secs => ${windowSeconds})
        ELSE rate_limits.reset_at END
    RETURNING count
  `)
  const count = Number(rows[0]?.count ?? 1)

  // Süresi geçmiş satırların pasif temizliği.
  await db.execute(sql`DELETE FROM rate_limits WHERE reset_at < now()`)

  return count <= options.max
}

const memoryLimiter = new Map<string, { count: number; resetAt: number }>()

function checkInMemory(key: string, options: RateLimitOptions): boolean {
  const now = Date.now()
  const entry = memoryLimiter.get(key)
  if (!entry || entry.resetAt < now) {
    memoryLimiter.set(key, { count: 1, resetAt: now + options.windowMs })
    return true
  }
  if (entry.count >= options.max) return false
  entry.count++
  return true
}

/** Tuzlanmış SHA-256 — ham IP saklanmaz, loglanmaz. */
export function hashIdentifier(input: string): string {
  const pepper = process.env.HASH_PEPPER ?? 'atelier-demo-pepper'
  return createHash('sha256').update(`${input}:${pepper}`).digest('hex')
}
