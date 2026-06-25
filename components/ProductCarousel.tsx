"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductCarouselProps {
  /** Real image URLs. If empty or undefined, shows the fallback. */
  images?: string[]
  /** Shown when no images are provided — typically the product's Lucide icon. */
  fallback: React.ReactNode
  productName?: string
}

export default function ProductCarousel({ images, fallback, productName }: ProductCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const hasImages = Array.isArray(images) && images.length > 0
  const count = hasImages ? images.length : 0
  const isSingle = count === 1

  const prev = () => setCurrent((c) => (c === 0 ? count - 1 : c - 1))
  const next = () => setCurrent((c) => (c === count - 1 ? 0 : c + 1))

  /* ── No real images: placeholder ── */
  if (!hasImages) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square flex items-center justify-center">
        {fallback}
        <span className="absolute bottom-3 right-3 text-2.5 text-slate-400 bg-white/80 px-2 py-0.5 rounded-full font-semibold">
          Imagen referencial
        </span>
      </div>
    )
  }

  /* ── Single image: just show it, no nav ── */
  if (isSingle) {
    return (
      <>
        <div
          className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square cursor-zoom-in group"
          onClick={() => setLightbox(true)}
        >
          <img
            src={images[0]}
            alt={productName ?? "Imagen del producto"}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <ZoomIn size={14} className="text-slate-700" />
          </div>
        </div>

        {lightbox && (
          <LightBox
            images={images}
            current={0}
            onClose={() => setLightbox(false)}
            productName={productName}
          />
        )}
      </>
    )
  }

  /* ── Multiple images: full carousel ── */
  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div
          className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square select-none cursor-zoom-in group"
          onClick={() => setLightbox(true)}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${productName ?? "Producto"} — imagen ${i + 1}`}
              className={cn(
                "absolute inset-0 w-full h-full object-contain transition-all duration-300",
                i === current ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            />
          ))}

          {/* Arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            <ChevronRight size={18} />
          </button>

          {/* Counter */}
          <span className="absolute top-3 right-3 z-20 bg-black/30 text-white text-2.5 font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {current + 1} / {count}
          </span>

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <ZoomIn size={14} className="text-slate-700" />
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                "shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150",
                i === current
                  ? "border-navy shadow-md"
                  : "border-transparent hover:border-slate-300"
              )}
            >
              <img
                src={src}
                alt={`Miniatura ${i + 1}`}
                className="w-full h-full object-contain bg-slate-100"
              />
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <LightBox
          images={images}
          current={current}
          onClose={() => setLightbox(false)}
          onPrev={prev}
          onNext={next}
          productName={productName}
        />
      )}
    </>
  )
}

function LightBox({
  images,
  current,
  onClose,
  onPrev,
  onNext,
  productName,
}: {
  images: string[]
  current: number
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  productName?: string
}) {
  const multi = images.length > 1
  return (
    <div
      className="fixed inset-0 z-999 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img
        src={images[current]}
        alt={productName ?? "Imagen ampliada"}
        className="max-w-full max-h-full object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
      {multi && onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Anterior"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {multi && onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Siguiente"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight size={22} />
        </button>
      )}
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 w-10 h-10 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors text-xl font-bold leading-none"
      >
        ✕
      </button>
      {multi && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {current + 1} / {images.length}
        </span>
      )}
    </div>
  )
}
