"use client"

import { useEffect, useRef, useState } from "react"
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/context/CartContext"
import { prefetchLeadToken, recordLead } from "@/lib/lead-beacon"

const NAME_KEY = "eca_contact_name"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, dispatch, total, itemCount, buildWhatsAppUrl } = useCart()
  const [name, setName] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)
  const hasName = name.trim().length > 0

  // Una sola vez al montar: leer localStorage en el render rompería la hidratación SSR.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(localStorage.getItem(NAME_KEY) ?? "")
    } catch {}
  }, [])

  function handleSend(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasName) {
      e.preventDefault()
      nameRef.current?.focus()
      return
    }
    try { localStorage.setItem(NAME_KEY, name.trim()) } catch {}
    // Registro silencioso en la bandeja; el enlace abre WhatsApp en el mismo clic.
    recordLead({ type: "cart", name: name.trim(), items: cart.map((i) => ({ id: i.id, qty: i.qty })) })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" showCloseButton={false} className="w-95 sm:w-95 p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="bg-navy px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-white" />
            <SheetTitle className="text-white font-display font-bold text-lg flex-1">
              Mi pedido ({itemCount} {itemCount === 1 ? "producto" : "productos"})
            </SheetTitle>
            <SheetClose className="text-white/70 hover:text-white transition-colors">
              <X size={18} />
              <span className="sr-only">Cerrar</span>
            </SheetClose>
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
                      <p className="text-2.75 text-slate-400 mt-0.5 font-mono">{item.code}</p>
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
            <p className="text-2.75 text-slate-400 leading-relaxed">
              El precio final y costo de envío son confirmados por el vendedor.
            </p>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Tu nombre
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={prefetchLeadToken}
                autoComplete="name"
                maxLength={120}
                placeholder="Para saber a quién atendemos"
                className="px-3 py-2 text-sm font-normal border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </label>
            <a
              href={buildWhatsAppUrl(name)}
              data-wa="carrito"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSend}
              aria-disabled={!hasName}
              className={`flex items-center justify-center gap-2 bg-wa hover:bg-wa/90 text-white font-semibold text-sm px-4 py-3 rounded-md transition-colors duration-150 active:scale-[0.98] ${
                hasName ? "" : "opacity-40 cursor-not-allowed"
              }`}
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
