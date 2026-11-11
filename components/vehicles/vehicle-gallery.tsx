'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { VehicleImage } from '@/types/vehicle'

interface VehicleGalleryProps {
  images: VehicleImage[]
  title: string
}

export function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const [index, setIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const multiple = images.length > 1

  const go = useCallback(
    (direction: 1 | -1) => setIndex((current) => (current + direction + images.length) % images.length),
    [images.length],
  )

  useEffect(() => {
    if (!fullscreen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [fullscreen, go])

  const current = images[index]
  const alt = current.alt ?? title

  return <div className="vehicle-gallery">
    <div className="gallery-main">
      <Image src={current.url} alt={alt} fill sizes="(max-width: 800px) 100vw, 55vw" className="gallery-img" priority={index === 0} onClick={() => setFullscreen(true)}/>
      {multiple && <>
        <button className="gallery-nav prev" aria-label="Önceki görsel" onClick={() => go(-1)}><ChevronLeft size={22}/></button>
        <button className="gallery-nav next" aria-label="Sonraki görsel" onClick={() => go(1)}><ChevronRight size={22}/></button>
        <span className="gallery-counter">{index + 1} / {images.length}</span>
      </>}
    </div>
    {multiple && <div className="gallery-thumbs" role="tablist" aria-label="Araç görselleri">
      {images.map((image, i) => <button key={image.url} className={i === index ? 'active' : ''} role="tab" aria-selected={i === index} aria-label={`Görsel ${i + 1}`} onClick={() => setIndex(i)}><Image src={image.url} alt={image.alt ?? `${title} — görsel ${i + 1}`} fill sizes="88px"/></button>)}
    </div>}
    {fullscreen && <div className="gallery-fullscreen" role="dialog" aria-modal="true" aria-label={`${title} — tam ekran galeri`} onClick={() => setFullscreen(false)}>
      {/* Tam ekranda ham çözünürlük — next/image optimizasyonu bilinçli kullanılmıyor */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={current.url} alt={alt} onClick={(e) => e.stopPropagation()}/>
      <button className="gallery-close" aria-label="Tam ekrandan çık" onClick={() => setFullscreen(false)}><X size={26}/></button>
      {multiple && <>
        <button className="gallery-nav prev" aria-label="Önceki görsel" onClick={(e) => { e.stopPropagation(); go(-1) }}><ChevronLeft size={30}/></button>
        <button className="gallery-nav next" aria-label="Sonraki görsel" onClick={(e) => { e.stopPropagation(); go(1) }}><ChevronRight size={30}/></button>
      </>}
      <span className="gallery-counter">{index + 1} / {images.length}</span>
    </div>}
  </div>
}
