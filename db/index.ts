import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '@/drizzle/schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL ortam değişkeni tanımlı değil.')
}

// Neon gibi sunucusuz sağlayıcılarla uyumlu; geliştirmede tek connection yeter.
const queryClient = postgres(connectionString, { max: 1 })

export const db = drizzle(queryClient, { schema })
