"use client"

import { ShoppingCart, Check } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { Product } from "@/types"

export default function AddToCartButton({ product }: { product: Product }) {
  const { dispatch } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    dispatch({ type: "ADD", product })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <button
      onClick={handleAdd}
      className={`inline-flex items-center justify-center gap-2 font-bold text-sm px-6 py-3.5 rounded-md transition-all duration-200 active:scale-[0.98] ${
        added
          ? "bg-emerald-600 text-white"
          : "bg-navy hover:bg-brand text-white"
      }`}
    >
      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
      {added ? "Agregado al pedido" : "Agregar al pedido"}
    </button>
  )
}
