"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Package } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { Product } from "@/types"

export default function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart()
  const primaryImage = product.images?.find(i => i.is_primary)?.url ?? product.images?.[0]?.url

  const effectivePrice = product.offer_price ?? product.price

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
      className="group relative flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-brand hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      {/* Full-card link (behind everything) */}
      <Link
        href={`/catalogo/${product.slug}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver ${product.title}`}
      />

      {/* Image area */}
      <div className="h-36 bg-slate-50 flex items-center justify-center relative overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-contain p-3"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <Package
            size={44}
            className="text-slate-300 group-hover:text-navy/25 transition-colors duration-200"
            strokeWidth={1.25}
          />
        )}
        {/* Type badge */}
        <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
          product.type === 'original' ? 'bg-navy text-white' :
          product.type === 'oem'      ? 'bg-blue-600 text-white' :
                                        'bg-brand text-white'
        }`}>
          {product.type === 'aftermarket' ? 'Alterno' : product.type}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <div>
          <p className="text-[10px] text-slate-400 font-semibold mb-0.5 uppercase tracking-wide">
            {product.part_brand?.name}
          </p>
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">{product.title}</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-tight">{product.short_description}</p>
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {product.offer_price && (
              <span className="text-xs text-slate-400 line-through leading-none">${product.price.toFixed(2)}</span>
            )}
            <span className={`font-display font-bold text-xl leading-none relative z-10 ${product.offer_price ? 'text-brand' : 'text-navy'}`}>
              ${effectivePrice.toFixed(2)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              dispatch({ type: "ADD", product })
            }}
            className="relative z-10 shrink-0 bg-navy hover:bg-brand text-white text-xs font-bold px-3 py-2 rounded-md transition-colors duration-150 active:scale-[0.97]"
          >
            Agregar
          </button>
        </div>
      </div>
    </motion.article>
  )
}
