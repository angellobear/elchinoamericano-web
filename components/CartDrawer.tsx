"use client"

import { useEffect, useState, useTransition } from "react"
import { CheckCircle, Minus, Plus, Trash2, MessageCircle, Send, ShoppingBag, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/context/CartContext"
import { trackLead } from "@/lib/analytics"
import { submitInboxMessage } from "@/modules/inbox/server/actions"
import type { ActionResult } from "@/modules/admin/shared/types/action-result"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

const CONTACT_KEY = "eca_contact"

// ponytail: localStorage solo para no reescribir nombre/teléfono; si falla, no pasa nada.
function readContact(): { name: string; phone: string } {
  try {
    const raw = localStorage.getItem(CONTACT_KEY)
    return raw ? JSON.parse(raw) : { name: "", phone: "" }
  } catch {
    return { name: "", phone: "" }
  }
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, dispatch, total, itemCount, buildWhatsAppUrl } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sentWaUrl, setSentWaUrl] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Una sola vez al montar: leer localStorage en el render rompería la hidratación SSR.
  useEffect(() => {
    const saved = readContact()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(saved.name)
    setPhone(saved.phone)
  }, [])

  function handleClose() {
    setSentWaUrl(null)
    setError(null)
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const waUrl = buildWhatsAppUrl()
    startTransition(async () => {
      const result: ActionResult = await submitInboxMessage({
        type: "cart",
        name,
        phone,
        website,
        items: cart.map((i) => ({ id: i.id, qty: i.qty })),
      }).catch(() => ({ ok: false, message: "No pudimos enviar tu pedido. Revisa tu conexión." }))

      if (!result.ok) {
        setError(result.message)
        return
      }
      try { localStorage.setItem(CONTACT_KEY, JSON.stringify({ name, phone })) } catch {}
      trackLead("carrito")
      setSentWaUrl(waUrl)
      dispatch({ type: "CLEAR" })
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
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
          {sentWaUrl ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
              <div className="w-14 h-14 bg-wa/10 rounded-full flex items-center justify-center">
                <CheckCircle size={28} className="text-wa" />
              </div>
              <div>
                <p className="font-display font-bold text-navy text-lg">¡Pedido recibido!</p>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">
                  Un asesor te contactará pronto para confirmar disponibilidad y envío.
                </p>
              </div>
              <a
                href={sentWaUrl}
                data-wa="carrito"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-wa hover:text-wa/80 transition-colors"
              >
                <MessageCircle size={16} />
                ¿Prefieres escribirnos ya? Abrir WhatsApp
              </a>
            </div>
          ) : cart.length === 0 ? (
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
          <form onSubmit={handleSubmit} className="shrink-0 px-6 py-5 border-t border-slate-100 flex flex-col gap-4 bg-white">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-500 font-medium">Total estimado</span>
              <span className="font-display font-bold text-navy text-2xl">
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="text-2.75 text-slate-400 leading-relaxed">
              El precio final y costo de envío son confirmados por el vendedor.
            </p>
            <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Nombre
                <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
                  className="px-3 py-2 text-sm font-normal border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Teléfono / WhatsApp
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel"
                  placeholder="09XX XXX XXX"
                  className="px-3 py-2 text-sm font-normal border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
              </label>
            </div>
            {error && (
              <div role="alert" className="flex flex-col gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <p>{error}</p>
                <a href={buildWhatsAppUrl()} data-wa="carrito" target="_blank" rel="noopener noreferrer" className="font-semibold text-wa">
                  Enviar por WhatsApp
                </a>
              </div>
            )}
            <button
              type="submit"
              disabled={pending || !name.trim() || !phone.trim()}
              className="flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-3 rounded-md transition-colors duration-150 active:scale-[0.98]"
            >
              <Send size={16} />
              {pending ? "Enviando…" : "Enviar pedido"}
            </button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
