import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { InventoryFilters, type InventoryFilterState } from '@/components/vehicles/inventory-filters'
import {
  getVehicles,
  filterVehicles,
  sortVehicles,
  type VehicleSortKey,
} from '@/lib/vehicles'
import { getSiteConfig } from '@/lib/site-config'

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  return {
    title: 'Araçlarımız',
    description: 'Farklı beklentilere hitap eden, özenle seçilmiş araç koleksiyonumuzu keşfedin.',
    alternates: { canonical: '/araclar' },
    openGraph: {
      title: `Araçlarımız — ${siteConfig.brand.name}`,
      description: 'Farklı beklentilere hitap eden, özenle seçilmiş araç koleksiyonumuzu keşfedin.',
      images: [{ url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=85' }],
    },
  }
}

type SearchParams = Record<string, string | string[] | undefined>

const SORT_KEYS: VehicleSortKey[] = ['price-asc', 'price-desc', 'mileage-asc', 'year-desc']

function readParam(params: SearchParams, key: string): string {
  const value = params[key]
  return typeof value === 'string' ? value.trim() : ''
}

function readNumberParam(params: SearchParams, key: string): string {
  const value = readParam(params, key)
  return /^\d+$/.test(value) ? value : ''
}

function toOptions(values: string[]) {
  return values.map((value) => ({ value, label: value }))
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const sortParam = readParam(params, 'sort')
  const sort = SORT_KEYS.includes(sortParam as VehicleSortKey) ? sortParam : ''

  const active: InventoryFilterState = {
    brand: readParam(params, 'brand'),
    model: readParam(params, 'model'),
    body: readParam(params, 'body'),
    fuel: readParam(params, 'fuel'),
    transmission: readParam(params, 'transmission'),
    status: readParam(params, 'status'),
    priceMin: readNumberParam(params, 'priceMin'),
    priceMax: readNumberParam(params, 'priceMax'),
    yearMin: readNumberParam(params, 'yearMin'),
    yearMax: readNumberParam(params, 'yearMax'),
    mileageMin: readNumberParam(params, 'mileageMin'),
    mileageMax: readNumberParam(params, 'mileageMax'),
    sort,
  }

  const all = await getVehicles()
  const brands = toOptions([...new Set(all.map((v) => v.brand))])
  // Model seçenekleri markaya bağlıdır; marka seçiliyse yalnız o markanın modelleri.
  const modelSource = active.brand ? all.filter((v) => v.brand === active.brand) : all
  const models = toOptions([...new Set(modelSource.map((v) => v.model))])
  const bodies = toOptions([...new Set(all.map((v) => v.body))])
  const fuels = toOptions([...new Set(all.map((v) => v.fuel))])
  const transmissions = toOptions([...new Set(all.map((v) => v.transmission))])
  const statuses = toOptions([...new Set(all.map((v) => v.status).filter((s) => s !== undefined))])

  const filtered = sortVehicles(
    filterVehicles(all, {
      brand: active.brand,
      model: active.model,
      body: active.body,
      fuel: active.fuel,
      transmission: active.transmission,
      status: active.status,
      priceMin: active.priceMin ? Number(active.priceMin) : undefined,
      priceMax: active.priceMax ? Number(active.priceMax) : undefined,
      yearMin: active.yearMin ? Number(active.yearMin) : undefined,
      yearMax: active.yearMax ? Number(active.yearMax) : undefined,
      mileageMin: active.mileageMin ? Number(active.mileageMin) : undefined,
      mileageMax: active.mileageMax ? Number(active.mileageMax) : undefined,
    }),
    sort as VehicleSortKey | '',
  )

  return <main><section className="page-hero"><span className="eyebrow">Koleksiyon</span><h1 className="page-title">Size uygun<br/>otomobili keşfedin.</h1><p>Farklı beklentilere hitap eden, özenle seçilmiş araç koleksiyonumuzu inceleyin.</p></section><section className="section"><div className="inventory-layout"><InventoryFilters active={active} brands={brands} models={models} bodies={bodies} fuels={fuels} transmissions={transmissions} statuses={statuses}/><div><div className="inventory-count"><span>{filtered.length} otomobil</span><span>Güncel koleksiyon</span></div>{filtered.length ? <div className="vehicle-grid">{filtered.map((v) => <VehicleCard key={v.slug} vehicle={v}/>)}</div> : <div className="intro-copy"><h3>Aramanızla eşleşen bir araç bulunamadı.</h3><p>Filtrelerinizi genişleterek koleksiyonumuzu yeniden keşfedin.</p><div className="status-actions"><Link href="/araclar" className="button">Filtreleri temizle</Link><Link href="/iletisim" className="text-link">Aradığınızı bulamadınız mı? Bize yazın <ArrowUpRight size={16}/></Link></div></div>}</div></div></section></main>
}
