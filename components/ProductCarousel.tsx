"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Slide {
  bg: string
  content: React.ReactNode
}

interface ProductCarouselProps {
  slides: Slide[]
}

export default function ProductCarousel({ slides }: ProductCarouselProps) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1))

  return (
    <div className="relative select-none rounded-2xl overflow-hidden bg-slate-100 aspect-square">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-400",
            slide.bg,
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {slide.content}
        </div>
      ))}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 flex items-center justify-center text-slate-700 hover:bg-white transition-colors shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 flex items-center justify-center text-slate-700 hover:bg-white transition-colors shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                i === current
                  ? "w-5 h-1.5 bg-navy"
                  : "w-1.5 h-1.5 bg-navy/30 hover:bg-navy/60"
              )}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      <div className="absolute top-3 right-3 z-20 bg-black/30 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
        {current + 1} / {slides.length}
      </div>
    </div>
  )
}
