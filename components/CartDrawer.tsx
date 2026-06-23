"use client"

import { Minus, Plus, Trash2, MessageCircle, ShoppingBag } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/context/CartContext"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, dispatch, total, itemCount, buildWhatsAppUrl } = useCart()

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[380px] sm:w-[380px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="bg-navy px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-white" />
            <SheetTitle className="text-white font-display font-bold text-lg">
              Mi pedido ({itemCount} {itemCount === 1 ? "producto" : "productos"})
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 py-16">
              <ShoppingBag size={40} strokeWidth={1.5} />
              <p className="text-sm text-center">
                Tu pedido está vacío.
                <br />
                Agrega repuestos desde el catálogo.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100">
              {cart.map((item) => (
                <li key={item.id} className="py-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{item.code}</p>
                    </div>
                    <button
                      onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                      className="text-slate-300 hover:text-brand transition-colors shrink-0 p-1"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-md overflow-hidden">
                      <button
                        onClick={() => dispatch({ type: "DECREMENT", id: item.id })}
                        className="px-2.5 py-1.5 hover:bg-slate-100 transition-colors"
                        aria-label="Disminuir"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => dispatch({ type: "INCREMENT", id: item.id })}
                        className="px-2.5 py-1.5 hover:bg-slate-100 transition-colors"
                        aria-label="Aumentar"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-display font-bold text-navy text-base">
                      ${((item.offer_price ?? item.price) * item.qty).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="shrink-0 px-6 py-5 border-t border-slate-100 flex flex-col gap-4 bg-white">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-500 font-medium">Total estimado</span>
              <span className="font-display font-bold text-navy text-2xl">
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              El precio final y costo de envío son confirmados por el vendedor.
            </p>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-wa hover:bg-wa/90 text-white font-semibold text-sm px-4 py-3 rounded-md transition-colors duration-150 active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              Enviar pedido por WhatsApp
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
