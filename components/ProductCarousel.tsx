"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Package, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEFAULT_PRODUCT_IMAGE_PATH } from "@/lib/seo"

interface ProductCarouselProps {
  images?: string[]
  productName?: string
  brandName?: string
  categoryName?: string
}

const LENS_SIZE = 190 // px
const LENS_HALF = LENS_SIZE / 2
const ZOOM = 8

export default function ProductCarousel({ images, productName, brandName, categoryName }: ProductCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const lensRef = useRef<HTMLDivElement>(null)

  const hasImages = Array.isArray(images) && images.length > 0
  const count = hasImages ? images.length : 0
  const isSingle = count === 1

  const prev = () => setCurrent((c) => (c === 0 ? count - 1 : c - 1))
  const next = () => setCurrent((c) => (c === count - 1 ? 0 : c + 1))

  function moveLens(e: React.MouseEvent<HTMLDivElement>, src: string) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    if (!lensRef.current) return
    lensRef.current.style.display = "block"
    lensRef.current.style.left = `${x * rect.width - LENS_HALF}px`
    lensRef.current.style.top = `${y * rect.height - LENS_HALF}px`
    lensRef.current.style.backgroundImage = `url(${src})`
    lensRef.current.style.backgroundPosition = `${x * 100}% ${y * 100}%`
  }

  function hideLens() {
    if (lensRef.current) lensRef.current.style.display = "none"
  }

  useEffect(() => {
    window.addEventListener("scroll", hideLens, { passive: true })
    return () => window.removeEventListener("scroll", hideLens)
  }, [])

  /* Shared lens element — rendered once, shared between modes */
  const lens = (
    <div
      ref={lensRef}
      aria-hidden
      className="pointer-events-none absolute z-20 hidden rounded-xl border-[1.5px] border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.22)]"
      style={{
        width: LENS_SIZE,
        height: LENS_SIZE,
        backgroundSize: `${ZOOM * 100}%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  )

  /* ── No real images: placeholder ── */
  if (!hasImages) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-square flex items-center justify-center">
        <div className="relative h-full w-full">
          <Image
            src={DEFAULT_PRODUCT_IMAGE_PATH}
            alt={`${productName ?? "Producto"} - imagen referencial`}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-x-4 bottom-4 rounded-xl bg-navy/84 px-4 py-3 text-left">
            <div className="flex items-center gap-2 text-white/80">
              <Package size={16} strokeWidth={1.5} />
              <span className="text-[11px] font-semibold uppercase tracking-[.08em]">
                Imagen referencial
              </span>
            </div>
            <p className="mt-2 font-display text-base font-bold leading-tight text-white">
              {brandName ?? productName ?? "Repuesto"}
            </p>
            {categoryName && (
              <p className="mt-1 text-xs text-white/70">{categoryName}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ── Single image ── */
  if (isSingle) {
    return (
      <>
        <div
          className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square cursor-crosshair group"
          onClick={() => setLightbox(true)}
          onMouseMove={(e) => moveLens(e, images[0])}
          onMouseLeave={hideLens}
        >
          {lens}
          <Image
            fill
            src={images[0]}
            alt={productName ?? "Imagen del producto"}
            title={productName ?? "Imagen del producto"}
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div onMouseEnter={hideLens} className="absolute bottom-3 right-3 z-30 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
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
        <div
          className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square select-none cursor-crosshair group"
          onClick={() => setLightbox(true)}
          onMouseMove={(e) => moveLens(e, images[current])}
          onMouseLeave={hideLens}
        >
          {lens}

          {images.map((src, i) => (
            <Image
              key={i}
              fill
              src={src}
              alt={`${productName ?? "Producto"} - imagen ${i + 1}`}
              title={`${productName ?? "Producto"} - imagen ${i + 1}`}
              className={cn(
                "object-contain transition-all duration-300",
                i === current ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ))}

          {/* Arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            onMouseEnter={hideLens}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            onMouseEnter={hideLens}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            <ChevronRight size={18} />
          </button>

          {/* Counter */}
          <span className="absolute top-3 right-3 z-30 bg-black/30 text-white text-2.5 font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {current + 1} / {count}
          </span>

          {/* Lightbox hint */}
          <div onMouseEnter={hideLens} className="absolute bottom-3 right-3 z-30 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
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
                "relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150",
                i === current
                  ? "border-navy shadow-md"
                  : "border-transparent hover:border-slate-300"
              )}
            >
              <Image
                fill
                src={src}
                alt={`Miniatura ${i + 1}`}
                title={`Miniatura ${i + 1}`}
                className="object-contain bg-slate-100"
                sizes="64px"
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft" && onPrev) onPrev()
      else if (e.key === "ArrowRight" && onNext) onNext()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-999 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[current]}
        alt={productName ?? "Imagen ampliada"}
        title={productName ?? "Imagen ampliada"}
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
