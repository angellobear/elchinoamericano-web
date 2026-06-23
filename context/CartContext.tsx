"use client"

import { createContext, useContext, useReducer, ReactNode } from "react"
import { CartItem, Product } from "@/types"

type Action =
  | { type: "ADD"; product: Product }
  | { type: "REMOVE"; id: number }
  | { type: "INCREMENT"; id: number }
  | { type: "DECREMENT"; id: number }
  | { type: "CLEAR" }

function toCartItem(product: Product): CartItem {
  return {
    id: product.id,
    code: product.code,
    title: product.title,
    short_title: product.short_title,
    price: product.price,
    offer_price: product.offer_price,
    slug: product.slug,
    primary_image: product.images?.find(i => i.is_primary)?.url ?? product.images?.[0]?.url,
    qty: 1,
  }
}

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const exists = state.find((i) => i.id === action.product.id)
      if (exists)
        return state.map((i) =>
          i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
        )
      return [...state, toCartItem(action.product)]
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id)
    case "INCREMENT":
      return state.map((i) =>
        i.id === action.id ? { ...i, qty: i.qty + 1 } : i
      )
    case "DECREMENT":
      return state.map((i) =>
        i.id === action.id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i
      )
    case "CLEAR":
      return []
    default:
      return state
  }
}

const CartContext = createContext<{
  cart: CartItem[]
  dispatch: React.Dispatch<Action>
  total: number
  itemCount: number
  buildWhatsAppUrl: () => string
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(reducer, [])
  const total = cart.reduce((s, i) => s + (i.offer_price ?? i.price) * i.qty, 0)
  const itemCount = cart.reduce((s, i) => s + i.qty, 0)

  function buildWhatsAppUrl() {
    const lines = cart
      .map(
        (i) =>
          `- ${i.title} x${i.qty} => $${((i.offer_price ?? i.price) * i.qty).toFixed(2)}`
      )
      .join("\n")
    const msg = `Hola! Quiero hacer el siguiente pedido:\n\n${lines}\n\nTotal estimado: $${total.toFixed(2)}\n\nPueden confirmarme disponibilidad y costo de envio?`
    return `https://wa.me/593984878153?text=${encodeURIComponent(msg)}`
  }

  return (
    <CartContext.Provider value={{ cart, dispatch, total, itemCount, buildWhatsAppUrl }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
