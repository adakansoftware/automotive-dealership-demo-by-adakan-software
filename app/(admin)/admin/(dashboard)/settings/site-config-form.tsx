'use client'

import { useActionState } from 'react'

import { updateSiteConfig, type SiteConfigFormResult } from '@/app/(admin)/admin/actions'

export function SiteConfigForm({ initialJson }: { initialJson: string }) {
  const [state, formAction, pending] = useActionState<SiteConfigFormResult, FormData>(
    updateSiteConfig,
    { error: '' },
  )

  return <form action={formAction} className="admin-form" noValidate>
    <label>
      <span>Site yapılandırması (JSON)</span>
      <textarea name="config" rows={24} defaultValue={initialJson} spellCheck={false}/>
    </label>
    {state.error && <p role="alert" className="admin-form-error">{state.error}</p>}
    <button type="submit" className="button primary" disabled={pending}>
      {pending ? 'Kaydediliyor…' : 'Ayarları kaydet'}
    </button>
  </form>
}
