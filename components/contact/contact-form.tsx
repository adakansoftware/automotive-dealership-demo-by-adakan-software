'use client'

import { useActionState } from 'react'
import { submitInquiry } from '@/app/iletisim/actions'
import { initialInquiryState } from '@/app/iletisim/inquiry-state'

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, initialInquiryState)

  if (state.status === 'success') {
    return <div className="intro-copy" role="status">
      <span className="eyebrow">Teşekkürler</span>
      <h3>Mesajınız alındı.</h3>
      <p>Sorgunuz kaydedildi; ekibimiz en kısa sürede sizinle iletişime geçecek.</p>
    </div>
  }

  return <form className="contact-form" action={formAction}>
    {state.status === 'rate-limited' && <p className="form-error" role="alert">Çok fazla deneme yaptınız. Lütfen 10 dakika sonra tekrar deneyin.</p>}
    {/* Honeypot: botlar doldurur, insanlar görmez — doluysa gönderim sessizce yok sayılır */}
    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}/>
    <label>Ad Soyad
      <input name="name" required minLength={2} autoComplete="name" defaultValue={state.values.name} placeholder="Adınız ve soyadınız" aria-invalid={state.errors.name ? true : undefined} aria-describedby={state.errors.name ? 'name-error' : undefined}/>
      {state.errors.name && <span id="name-error" className="form-error" role="alert">{state.errors.name}</span>}
    </label>
    <label>Telefon
      <input name="phone" type="tel" required autoComplete="tel" defaultValue={state.values.phone} placeholder="+90 5xx xxx xx xx" aria-invalid={state.errors.phone ? true : undefined} aria-describedby={state.errors.phone ? 'phone-error' : undefined}/>
      {state.errors.phone && <span id="phone-error" className="form-error" role="alert">{state.errors.phone}</span>}
    </label>
    <label>E-posta
      <input name="email" type="email" required autoComplete="email" defaultValue={state.values.email} placeholder="ornek@mail.com" aria-invalid={state.errors.email ? true : undefined} aria-describedby={state.errors.email ? 'email-error' : undefined}/>
      {state.errors.email && <span id="email-error" className="form-error" role="alert">{state.errors.email}</span>}
    </label>
    <label>Mesajınız
      <textarea name="message" required minLength={10} defaultValue={state.values.message} placeholder="Size nasıl yardımcı olabiliriz?" aria-invalid={state.errors.message ? true : undefined} aria-describedby={state.errors.message ? 'message-error' : undefined}/>
      {state.errors.message && <span id="message-error" className="form-error" role="alert">{state.errors.message}</span>}
    </label>
    <button type="submit" disabled={pending}>{pending ? 'Gönderiliyor…' : 'Mesaj gönder'}</button>
    <small style={{ color: '#777b7e', lineHeight: 1.5 }}>Bilgileriniz yalnızca talebinize dönüş yapmak için kullanılır.</small>
  </form>
}
