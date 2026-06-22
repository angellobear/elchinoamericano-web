"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Droplets, CircleDot, Filter, Spline, Zap, ArrowUpDown,
  Thermometer, Disc3, Settings2, Eye, Wind, Activity, Package,
} from "lucide-react"
import { useCart } from "@/context/CartContext"
import { Product } from "@/types"

const ICON_MAP: Record<string, React.ElementType> = {
  Droplets, CircleDot, Filter, Spline, Zap, ArrowUpDown,
  Thermometer, Disc3, Settings2, Eye, Wind, Activity,
}

export default function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart()
  const Icon = ICON_MAP[product.icon] ?? Package

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
        href={`/catalogo/${product.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver ${product.name}`}
      />

      {/* Icon area */}
      <div className="h-36 bg-slate-50 flex items-center justify-center">
        <Icon
          size={44}
          className="text-slate-300 group-hover:text-navy/30 transition-colors duration-200"
          strokeWidth={1.5}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <div>
          <p className="text-[10px] text-slate-400 font-semibold mb-0.5 uppercase tracking-wide">
            {product.brandProduct}
          </p>
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">{product.name}</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-tight">{product.compatible}</p>
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <span className="font-display font-bold text-navy text-xl leading-none relative z-10">
            ${product.price.toFixed(2)}
          </span>
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
