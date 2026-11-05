import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '@/drizzle/schema'

/**
 * DB istemcisi tembel (lazy) kurulur: `DATABASE_URL` yoksa modül import'u
 * hata vermez, site demo veriyle çalışmaya devam eder (build/test ortamı).
 * Gerçek bağlantı ancak `getDb()` çağrılınca kurulur.
 */

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export type AppDatabase = ReturnType<typeof createDb>

function createDb() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL ortam değişkeni tanımlı değil.')
  }
  // Neon gibi sunucusuz sağlayıcılarla uyumlu; geliştirmede tek connection yeter.
  const queryClient = postgres(connectionString, { max: 1 })
  return drizzle(queryClient, { schema })
}

let instance: AppDatabase | undefined

export function getDb(): AppDatabase {
  instance ??= createDb()
  return instance
}
