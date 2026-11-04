'use client'

import { useState } from 'react'

export function ContactForm() {
  const [sent, setSent] = useState(false)
  if (sent) return <div className="intro-copy"><span className="eyebrow">Teşekkürler</span><h3>Mesajınız hazır.</h3><p>Bu frontend demo formudur. Gerçek gönderim için iletişim bilgilerinizi yapılandırabilirsiniz.</p></div>
  return <form className="contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
    <label>Ad Soyad<input required placeholder="Adınız ve soyadınız"/></label>
    <label>Telefon<input required placeholder="+90"/></label>
    <label>E-posta<input type="email" required placeholder="ornek@mail.com"/></label>
    <label>Mesajınız<textarea required placeholder="Size nasıl yardımcı olabiliriz?"/></label>
    <button type="submit">Mesaj gönder</button>
    <small style={{ color: '#777b7e', lineHeight: 1.5 }}>Bu form demo amaçlıdır. Gönderim sonrası başarı durumu gösterilir.</small>
  </form>
}
