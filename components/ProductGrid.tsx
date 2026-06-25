"use client"

import { AnimatePresence, motion } from "framer-motion"
import { PackageSearch } from "lucide-react"
import ProductCard from "@/components/ProductCard"
import { Product } from "@/types"

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="min-h-100">
      <AnimatePresence mode="popLayout">
        {products.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400"
          >
            <PackageSearch size={48} strokeWidth={1.5} />
            <div className="text-center">
              <p className="font-semibold text-slate-600">No encontramos repuestos</p>
              <p className="text-sm mt-1">con esos filtros. Prueba con otra combinación.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
