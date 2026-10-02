'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import { LightBox } from '@/components/ProductCarousel'

/** Miniaturas de las fotos de evidencia; al hacer clic se abren en grande. Solo pantalla, nunca en el PDF. */
export function DeliveryPhotos({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState<number | null>(null)

  if (photos.length === 0) return null

  const step = (delta: number) =>
    setCurrent((index) => (index === null ? null : (index + delta + photos.length) % photos.length))

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {photos.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Ampliar foto de evidencia ${index + 1}`}
            className="group relative overflow-hidden rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy/30"
          >
            <Image
              src={url}
              alt={`Foto de evidencia ${index + 1}`}
              width={352}
              height={256}
              className="h-32 w-44 object-cover transition-transform group-hover:scale-105"
            />
            <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-700">
              <ZoomIn size={13} />
            </span>
          </button>
        ))}
      </div>

      {current !== null ? (
        <LightBox
          images={photos}
          current={current}
          onClose={() => setCurrent(null)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          productName="Evidencia de entrega"
        />
      ) : null}
    </>
  )
}
