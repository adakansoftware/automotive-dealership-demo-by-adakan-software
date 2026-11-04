'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SelectField, type SelectFieldOption } from '@/components/ui/select-field'

export interface InventoryFilterState {
  brand: string
  model: string
  body: string
  fuel: string
  transmission: string
  status: string
  priceMin: string
  priceMax: string
  yearMin: string
  yearMax: string
  mileageMin: string
  mileageMax: string
  sort: string
}

type FilterKey = keyof InventoryFilterState

const SORT_OPTIONS: SelectFieldOption[] = [
  { value: 'year-desc', label: 'En Yeni' },
  { value: 'price-asc', label: 'Fiyat (Düşükten Yükseğe)' },
  { value: 'price-desc', label: 'Fiyat (Yüksekten Düşüğe)' },
  { value: 'mileage-asc', label: 'Kilometre (Düşükten Yükseğe)' },
]

interface RangeFieldProps {
  label: string
  min: string
  max: string
  minPlaceholder?: string
  maxPlaceholder?: string
  onCommit: (min: string, max: string) => void
}

/** Sayısal aralık girişi — commit yalnız blur/Enter'da (her tuş vuruşunda navigation olmasın). */
function RangeField({ label, min, max, minPlaceholder = 'En düşük', maxPlaceholder = 'En yüksek', onCommit }: RangeFieldProps) {
  const [localMin, setLocalMin] = useState(min)
  const [localMax, setLocalMax] = useState(max)

  useEffect(() => { setLocalMin(min); setLocalMax(max) }, [min, max])

  const commit = () => {
    if (localMin !== min || localMax !== max) onCommit(localMin.trim(), localMax.trim())
  }

  return <label className="filter-field"><span>{label}</span><div className="range-fields">
    <input type="number" min={0} inputMode="numeric" placeholder={minPlaceholder} value={localMin} onChange={(e) => setLocalMin(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} aria-label={`${label} alt sınır`}/>
    <input type="number" min={0} inputMode="numeric" placeholder={maxPlaceholder} value={localMax} onChange={(e) => setLocalMax(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} aria-label={`${label} üst sınır`}/>
  </div></label>
}

interface InventoryFiltersProps {
  active: InventoryFilterState
  brands: SelectFieldOption[]
  models: SelectFieldOption[]
  bodies: SelectFieldOption[]
  fuels: SelectFieldOption[]
  transmissions: SelectFieldOption[]
  statuses: SelectFieldOption[]
}

export function InventoryFilters({ active, brands, models, bodies, fuels, transmissions, statuses }: InventoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = (key: FilterKey, value: string, alsoDelete: FilterKey[] = []) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    alsoDelete.forEach((extra) => params.delete(extra))
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const clear = () => router.push(pathname, { scroll: false })

  return <aside><div className="filter-panel">
    <SelectField label="Marka" value={active.brand} onChange={(v) => update('brand', v, ['model'])} options={brands}/>
    {models.length > 0 && <SelectField label="Model" value={active.model} onChange={(v) => update('model', v)} options={models}/>}
    <SelectField label="Kasa tipi" value={active.body} onChange={(v) => update('body', v)} options={bodies}/>
    <SelectField label="Yakıt türü" value={active.fuel} onChange={(v) => update('fuel', v)} options={fuels}/>
    <SelectField label="Vites" value={active.transmission} onChange={(v) => update('transmission', v)} options={transmissions}/>
    {statuses.length > 0 && <SelectField label="Durum" value={active.status} onChange={(v) => update('status', v)} options={statuses}/>}
    <RangeField label="Fiyat (₺)" min={active.priceMin} max={active.priceMax} onCommit={(min, max) => { update('priceMin', min); update('priceMax', max) }}/>
    <RangeField label="Yıl" min={active.yearMin} max={active.yearMax} onCommit={(min, max) => { update('yearMin', min); update('yearMax', max) }}/>
    <RangeField label="Kilometre" min={active.mileageMin} max={active.mileageMax} onCommit={(min, max) => { update('mileageMin', min); update('mileageMax', max) }}/>
    <SelectField label="Sıralama" value={active.sort} onChange={(v) => update('sort', v)} options={SORT_OPTIONS} placeholder="Önerilen"/>
  </div><button className="clear-button" onClick={clear}>Filtreleri temizle</button></aside>
}
