import { cache } from 'react'
import { eq } from 'drizzle-orm'

import { siteConfig as demoSiteConfig, type SiteConfig } from '@/data/site-config'
import { getDb, isDbConfigured } from '@/db'
import { siteConfigTable } from '@/drizzle/schema'

/**
 * Site yapılandırması. `DATABASE_URL` tanımlıysa `site_config` tablosunun
 * `site` anahtarından, yoksa demo yer tutucudan okur. Admin paneldeki
 * ayarlar sayfası bu tabloyu günceller; demo modunda değişiklik kalıcı
 * değildir.
 */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  if (!isDbConfigured()) return demoSiteConfig

  const db = getDb()
  const rows = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, 'site'))
  const value = rows[0]?.value
  if (!value) return demoSiteConfig
  // Tabloyu tohum betiği SiteConfig şekliyle doldurur; güvenli kalıp.
  return value as SiteConfig
})
