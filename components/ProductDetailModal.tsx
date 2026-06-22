"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, MessageCircle, ShoppingCart } from "lucide-react"
import {
  Droplets, CircleDot, Filter, Spline, Zap, ArrowUpDown,
  Thermometer, Disc3, Settings2, Eye, Wind, Activity, Package,
} from "lucide-react"
import { useCart } from "@/context/CartContext"
import { Product } from "@/types"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ElementType> = {
  Droplets, CircleDot, Filter, Spline, Zap, ArrowUpDown,
  Thermometer, Disc3, Settings2, Eye, Wind, Activity,
}

interface ProductDetailModalProps {
  product: Product | null
  onClose: () => void
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { dispatch } = useCart()
  const Icon = product ? (ICON_MAP[product.icon] ?? Package) : Package

  function handleAdd() {
    if (!product) return
    dispatch({ type: "ADD", product })
    onClose()
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm text-white",
                      product.type === "original" ? "bg-navy" : "bg-brand"
                    )}
                  >
                    {product.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{product.brandProduct}</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-6">
                {/* Icon area */}
                <div className="flex items-center gap-6">
                  <div className="w-28 h-28 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                    <Icon size={56} className="text-navy/30" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="font-display font-bold text-navy text-2xl leading-tight">
                      {product.name}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">{product.brandProduct}</p>
                    <span className="font-display font-bold text-navy text-3xl">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex flex-col gap-3 bg-slate-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Categoría</span>
                      <p className="text-slate-800 font-medium mt-0.5 capitalize">{product.category}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Tipo</span>
                      <p className="text-slate-800 font-medium mt-0.5 capitalize">{product.type}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Compatible con</span>
                      <p className="text-slate-800 font-medium mt-0.5">{product.compatible}</p>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  El precio y disponibilidad se confirman con el vendedor. Enviamos a todo Ecuador.
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 bg-navy hover:bg-brand text-white font-bold text-sm py-3 rounded-md transition-colors duration-150 active:scale-[0.98]"
                >
                  <ShoppingCart size={16} />
                  Agregar al pedido
                </button>
                <a
                  href={`https://wa.me/593984878153?text=${encodeURIComponent(`Hola! Quiero consultar sobre: ${product.name} (${product.compatible}) - $${product.price}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-wa hover:bg-wa/90 text-white font-bold text-sm px-4 py-3 rounded-md transition-colors duration-150 active:scale-[0.98]"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
