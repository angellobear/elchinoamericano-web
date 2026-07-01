"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MessageCircle, Package } from "lucide-react"
import { Product } from "@/types"
import { getWhatsAppUrl } from "@/lib/constants"
import { buildProductPath } from "@/lib/product-slugs"
import { DEFAULT_PRODUCT_IMAGE_PATH, getProductPrimaryImage } from "@/lib/seo"

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  original: { label: "Original", cls: "bg-navy text-white" },
  oem:      { label: "OEM",      cls: "bg-[#1f9d57] text-white" },
  aftermarket: { label: "Alterno", cls: "bg-brand text-white" },
}

export default function ProductCard({ product }: { product: Product }) {
  const primaryImage = getProductPrimaryImage(product)
  const displayImage = primaryImage ?? DEFAULT_PRODUCT_IMAGE_PATH
  const effectivePrice = product.offer_price ?? product.price
  const badge = TYPE_BADGE[product.type] ?? TYPE_BADGE.aftermarket
  const discountPct = product.offer_price
    ? Math.round((1 - product.offer_price / product.price) * 100)
    : 0
  const waMsg =
    `Hola! Me interesa: ${product.title} (Cód: ${product.code}). ¿Está disponible?`

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
      className="group relative flex flex-col border border-[#e6e9ef] rounded-2xl overflow-hidden bg-white hover:border-brand hover:shadow-[0_22px_44px_rgba(13,31,60,.16)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      {/* Full-card link */}
      <Link
        href={buildProductPath(product)}
        className="absolute inset-0 z-0"
        aria-label={`Ver ${product.title}`}
        title={`Ver detalle de ${product.title}`}
      />

      {/* Image 4:3 */}
      <div className="relative aspect-square overflow-hidden pointer-events-none">
        <Image
          src={displayImage}
          alt={primaryImage ? product.title : `${product.title} - imagen referencial`}
          fill
          className={primaryImage ? "object-cover bg-[#f3f5f9]" : "object-contain p-3 bg-[#f3f5f9]"}
          sizes="(max-width: 640px) 50vw, 33vw"
          loading={primaryImage ? "lazy" : "eager"}
        />
        {!primaryImage && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-navy/82 px-3 py-2 text-white">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-white/70" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold uppercase tracking-[.08em]">
                Imagen referencial
              </span>
            </div>
            {product.category?.name && (
              <span className="text-[11px] text-white/70">{product.category.name}</span>
            )}
          </div>
        )}
        {/* Type badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-tiny font-bold uppercase tracking-[.06em] z-1 ${badge.cls}`}>
          {badge.label}
        </span>
        {/* Discount badge */}
        {discountPct > 0 && (
          <span className="absolute top-3 right-3 bg-brand text-white px-2 py-1 rounded-md text-2.5 font-bold uppercase tracking-wider z-1">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-[15px_17px_17px] pointer-events-none">
        <p className="text-2.75 font-semibold uppercase tracking-[.06em] text-[#8a93a3]">
          {product.part_brand?.name}
        </p>
        <h3 className="font-display font-bold text-4.75 uppercase text-navy leading-[1.12] mt-1.25">
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
            href={getWhatsAppUrl(waMsg)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={`Consultar ${product.title} por WhatsApp`}
            className="relative z-10 pointer-events-auto flex items-center gap-1.5 bg-wa hover:brightness-105 text-[#062b15] font-bold text-3 px-[13px] py-2.5 rounded-[9px] transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa"
          >
            <MessageCircle size={14} />
            Consultar
          </a>
        </div>
      </div>
    </motion.article>
  )
}
