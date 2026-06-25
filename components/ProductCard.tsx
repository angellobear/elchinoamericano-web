"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MessageCircle, Package } from "lucide-react"
import { Product } from "@/types"

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  original: { label: "Original", cls: "bg-navy text-white" },
  oem:      { label: "OEM",      cls: "bg-emerald-700 text-white" },
  aftermarket: { label: "Alterno", cls: "bg-brand text-white" },
}

export default function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images?.find(i => i.is_primary)?.url ?? product.images?.[0]?.url
  const effectivePrice = product.offer_price ?? product.price
  const badge = TYPE_BADGE[product.type] ?? TYPE_BADGE.aftermarket
  const discountPct = product.offer_price
    ? Math.round((1 - product.offer_price / product.price) * 100)
    : 0
  const waMsg = encodeURIComponent(
    `Hola! Me interesa: ${product.title} (Cód: ${product.code}). ¿Está disponible?`
  )

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
      className="group relative flex flex-col border border-[#e6e9ef] rounded-4 overflow-hidden bg-white hover:border-brand hover:shadow-[0_22px_44px_rgba(13,31,60,.16)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      {/* Full-card link */}
      <Link
        href={`/catalogo/${product.slug}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver ${product.title}`}
      />

      {/* Image 4:3 */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-contain p-3 bg-[#f3f5f9]"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-navy flex flex-col items-center justify-center gap-2">
            <Package size={44} className="text-white/20" strokeWidth={1.25} />
            <span className="text-2.5 text-[#5f7090] font-mono">{product.category?.name}</span>
          </div>
        )}
        {/* Type badge */}
        <span className={`absolute top-3 left-3 px-2 py-1 rounded-1.5 text-2.5 font-bold uppercase tracking-[.06em] z-1 ${badge.cls}`}>
          {badge.label}
        </span>
        {/* Discount badge */}
        {discountPct > 0 && (
          <span className="absolute top-3 right-3 bg-brand text-white px-2 py-1 rounded-1.5 text-2.5 font-bold uppercase tracking-[.05em] z-1">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-[15px_17px_17px]">
        <p className="text-2.75 font-semibold uppercase tracking-[.06em] text-[#8a93a3]">
          {product.part_brand?.name}
        </p>
        <h3 className="font-display font-bold text-4.75 uppercase text-navy leading-[1.12] mt-1">
          {product.title}
        </h3>

        <div className="flex items-end justify-between mt-auto pt-4">
          <div>
            {product.offer_price && (
              <p className="text-3 text-[#9aa3b2] line-through leading-none">${product.price.toFixed(2)}</p>
            )}
            <span className="font-display font-bold text-6.75 text-navy leading-none">
              ${effectivePrice.toFixed(2)}
            </span>
          </div>
          <a
            href={`https://wa.me/593984878153?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex items-center gap-1.5 bg-wa hover:brightness-105 text-[#062b15] font-bold text-3 px-3 py-2.5 rounded-2.25 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa"
          >
            <MessageCircle size={14} />
            Consultar
          </a>
        </div>
      </div>
    </motion.article>
  )
}
