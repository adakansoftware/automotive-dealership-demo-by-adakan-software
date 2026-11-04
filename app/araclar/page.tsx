import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { InventoryFilters } from '@/components/vehicles/inventory-filters'
import {
  getVehicles,
  filterVehicles,
  sortVehicles,
  type VehicleSortKey,
} from '@/lib/vehicles'

type SearchParams = Record<string, string | string[] | undefined>

const SORT_KEYS: VehicleSortKey[] = ['price-asc', 'price-desc', 'year-desc']

function readParam(params: SearchParams, key: string): string {
  const value = params[key]
  return typeof value === 'string' ? value : ''
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const sortParam = readParam(params, 'sort')
  const sort = SORT_KEYS.includes(sortParam as VehicleSortKey) ? (sortParam as VehicleSortKey) : ''
  const active = {
    brand: readParam(params, 'brand'),
    body: readParam(params, 'body'),
    fuel: readParam(params, 'fuel'),
    sort,
  }

  const all = getVehicles()
  const brands = [...new Set(all.map((v) => v.brand))].map((value) => ({ value, label: value }))
  const bodies = [...new Set(all.map((v) => v.body))].map((value) => ({ value, label: value }))
  const fuels = [...new Set(all.map((v) => v.fuel))].map((value) => ({ value, label: value }))
  const filtered = sortVehicles(filterVehicles(all, active), sort)

  return <main><section className="page-hero"><span className="eyebrow">Koleksiyon</span><h1 className="page-title">Size uygun<br/>otomobili keşfedin.</h1><p>Farklı beklentilere hitap eden, özenle seçilmiş araç koleksiyonumuzu inceleyin.</p></section><section className="section"><div className="inventory-layout"><InventoryFilters active={active} brands={brands} bodies={bodies} fuels={fuels}/><div><div className="inventory-count"><span>{filtered.length} otomobil</span><span>Güncel koleksiyon</span></div>{filtered.length ? <div className="vehicle-grid">{filtered.map((v) => <VehicleCard key={v.slug} vehicle={v}/>)}</div> : <div className="intro-copy"><h3>Aramanızla eşleşen bir araç bulunamadı.</h3><p>Filtrelerinizi genişleterek koleksiyonumuzu yeniden keşfedin.</p></div>}</div></div></section></main>
}
