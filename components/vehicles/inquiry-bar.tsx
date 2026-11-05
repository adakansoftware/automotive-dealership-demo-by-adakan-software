import Link from 'next/link'
import { ArrowUpRight, Phone, MessageCircle } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'
import { getSiteConfig } from '@/lib/site-config'

export async function InquiryBar({ vehicle }: { vehicle: Vehicle }) { const siteConfig = await getSiteConfig(); const text = encodeURIComponent(`Merhaba, ${vehicle.brand} ${vehicle.model} (ata-${vehicle.slug}) hakkında bilgi almak istiyorum.`); return <div className="inquiry-bar"><a href={`${siteConfig.contact.whatsapp}?text=${text}`} target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp ile Bilgi Al</a><a href={siteConfig.contact.phoneHref}><Phone size={17}/> Hemen Ara</a><Link href="/iletisim">İletişime Geç <ArrowUpRight size={17}/></Link></div> }
