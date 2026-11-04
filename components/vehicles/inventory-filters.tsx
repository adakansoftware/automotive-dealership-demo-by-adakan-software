'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SelectField, type SelectFieldOption } from '@/components/ui/select-field'

export interface InventoryFilterState {
  brand: string
  body: string
  fuel: string
  sort: string
}

const SORT_OPTIONS: SelectFieldOption[] = [
  { value: 'price-asc', label: 'Fiyat (Düşükten Yükseğe)' },
  { value: 'price-desc', label: 'Fiyat (Yüksekten Düşüğe)' },
  { value: 'year-desc', label: 'En Yeni' },
]

interface InventoryFiltersProps {
  active: InventoryFilterState
  brands: SelectFieldOption[]
  bodies: SelectFieldOption[]
  fuels: SelectFieldOption[]
}

export function InventoryFilters({ active, brands, bodies, fuels }: InventoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = (key: keyof InventoryFilterState, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const clear = () => router.push(pathname, { scroll: false })

  return <aside><div className="filter-panel">
    <SelectField label="Marka" value={active.brand} onChange={(v) => update('brand', v)} options={brands}/>
    <SelectField label="Kasa tipi" value={active.body} onChange={(v) => update('body', v)} options={bodies}/>
    <SelectField label="Yakıt türü" value={active.fuel} onChange={(v) => update('fuel', v)} options={fuels}/>
    <SelectField label="Sıralama" value={active.sort} onChange={(v) => update('sort', v)} options={SORT_OPTIONS} placeholder="Önerilen"/>
  </div><button className="clear-button" onClick={clear}>Filtreleri temizle</button></aside>
}
