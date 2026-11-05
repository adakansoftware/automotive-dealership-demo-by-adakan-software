import type { MetadataRoute } from 'next'
import { getVehicles } from '@/lib/vehicles'
import { getSiteConfig } from '@/lib/site-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteConfig = await getSiteConfig()
  const staticRoutes: MetadataRoute.Sitemap = ['', '/araclar', '/hakkimizda', '/iletisim'].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }))
  const vehicleRoutes: MetadataRoute.Sitemap = (await getVehicles()).map((vehicle) => ({
    url: `${siteConfig.url}/araclar/${vehicle.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))
  return [...staticRoutes, ...vehicleRoutes]
}
