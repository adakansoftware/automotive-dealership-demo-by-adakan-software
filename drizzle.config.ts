import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// .env.local öncelikli (README akışı), yoksa .env
config({ path: '.env.local' })
config()

export default defineConfig({
  dialect: 'postgresql',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
