'use client'

import { useActionState } from 'react'

import {
  createVehicle,
  updateVehicle,
  type VehicleFormResult,
} from '@/app/(admin)/admin/actions'
import {
  VEHICLE_BODY_TYPES,
  VEHICLE_CONDITIONS,
  VEHICLE_FUEL_TYPES,
  VEHICLE_STATUSES,
  VEHICLE_TRANSMISSIONS,
} from '@/types/vehicle'

export interface VehicleFormInitial {
  brand: string
  model: string
  trim: string
  year: string
  price: string
  mileage: string
  fuel: string
  transmission: string
  body: string
  status: string
  condition: string
  color: string
  featured: boolean
  description: string
  images: string
  specs: string
}

const INITIAL: VehicleFormInitial = {
  brand: '',
  model: '',
  trim: '',
  year: String(new Date().getFullYear()),
  price: '',
  mileage: '',
  fuel: 'Benzin',
  transmission: 'Otomatik',
  body: 'Sedan',
  status: 'Satışta',
  condition: 'İkinci El',
  color: '',
  featured: false,
  description: '',
  images: '',
  specs: '',
}

export function VehicleForm({
  mode,
  slug,
  initial,
}: {
  mode: 'create' | 'edit'
  slug?: string
  initial?: Partial<VehicleFormInitial>
}) {
  const values = { ...INITIAL, ...initial }
  const [state, formAction, pending] = useActionState<VehicleFormResult, FormData>(
    mode === 'create' ? createVehicle : updateVehicle,
    { error: '' },
  )

  return <form action={formAction} className="admin-form" noValidate>
    {slug && <input type="hidden" name="slug" value={slug}/>}
    <div className="admin-form-row">
      <label>
        <span>Marka *</span>
        <input name="brand" defaultValue={values.brand} required/>
      </label>
      <label>
        <span>Model *</span>
        <input name="model" defaultValue={values.model} required/>
      </label>
      <label>
        <span>Donanım (trim)</span>
        <input name="trim" defaultValue={values.trim}/>
      </label>
    </div>
    <div className="admin-form-row">
      <label>
        <span>Yıl *</span>
        <input name="year" type="number" min={1980} max={2100} defaultValue={values.year} required/>
      </label>
      <label>
        <span>Fiyat (TL) *</span>
        <input name="price" type="number" min={0} step={1000} defaultValue={values.price} required/>
      </label>
      <label>
        <span>Kilometre *</span>
        <input name="mileage" type="number" min={0} defaultValue={values.mileage} required/>
      </label>
    </div>
    <div className="admin-form-row">
      <label>
        <span>Yakıt</span>
        <select name="fuel" defaultValue={values.fuel}>
          {VEHICLE_FUEL_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label>
        <span>Vites</span>
        <select name="transmission" defaultValue={values.transmission}>
          {VEHICLE_TRANSMISSIONS.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label>
        <span>Kasa</span>
        <select name="body" defaultValue={values.body}>
          {VEHICLE_BODY_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
    </div>
    <div className="admin-form-row">
      <label>
        <span>Durum</span>
        <select name="status" defaultValue={values.status}>
          {VEHICLE_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label>
        <span>Aracı sınıfı</span>
        <select name="condition" defaultValue={values.condition}>
          {VEHICLE_CONDITIONS.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label>
        <span>Renk</span>
        <input name="color" defaultValue={values.color}/>
      </label>
    </div>
    <label>
      <span>Açıklama — ilk paragraf arama sonuçlarında ve sosyal paylaşımlarda özet olarak kullanılır; paragrafları boş bir satırla ayırın</span>
      <textarea name="description" rows={6} defaultValue={values.description}/>
    </label>
    <label>
      <span>Görseller — her satır: <code>url | açıklama</code> (ilk satır anahtar görsel)</span>
      <textarea name="images" rows={4} defaultValue={values.images} placeholder="/vehicles/ornek.jpg | ön görünüm"/>
    </label>
    <label>
      <span>Künye — her satır: <code>etiket | değer</code></span>
      <textarea name="specs" rows={4} defaultValue={values.specs} placeholder="Motor | 4.0 V8 TWIN-TURBO"/>
    </label>
    <label className="admin-check">
      <input type="checkbox" name="featured" defaultChecked={values.featured}/>
      <span>Öne çıkan (anasayfa "Küratörün seçimi")</span>
    </label>
    {state.error && <p role="alert" className="admin-form-error">{state.error}</p>}
    <button type="submit" className="button primary" disabled={pending}>
      {pending ? 'Kaydediliyor…' : mode === 'create' ? 'Aracı oluştur' : 'Değişiklikleri kaydet'}
    </button>
  </form>
}
