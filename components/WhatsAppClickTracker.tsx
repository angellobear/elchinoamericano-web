"use client"

import { useEffect } from "react"
import { trackWhatsApp } from "@/lib/analytics"
import { prefetchLeadToken, recordLead } from "@/lib/lead-beacon"

/** Escucha los clics a WhatsApp de todo el sitio: evento GA4 + consulta en la bandeja. */
export function WhatsAppClickTracker() {
  // ponytail: un listener delegado cubre todos los <a> a WhatsApp, incluidos los
  // que viven en Server Components. Cada boton solo declara data-wa="...".
  // El mismo listener registra cada clic como consulta anónima en la bandeja (silencioso).
  useEffect(() => {
    const waLink = (target: EventTarget | null) =>
      (target as HTMLElement | null)?.closest?.('a[href*="api.whatsapp.com/send"], a[href*="wa.me/"]') as HTMLAnchorElement | null
    // El admin (contactar clientes) y /pedido no son leads del sitio público.
    const isPublicPage = () => !/^\/(admin|pedido)(\/|$)/.test(window.location.pathname)

    const onClick = (e: MouseEvent) => {
      const link = waLink(e.target)
      // aria-disabled: el carrito sin nombre bloquea el envío; no cuenta como clic.
      if (!link || link.getAttribute("aria-disabled") === "true") return
      const source = link.dataset.wa ?? "sin_etiqueta"
      trackWhatsApp(source, link.dataset.waItem)
      // El carrito registra su propio lead (con productos y nombre) desde CartDrawer.
      if (source !== "carrito" && isPublicPage()) {
        recordLead({ type: "whatsapp", payload: { source, item: link.dataset.waItem, page: window.location.pathname } })
      }
    }
    const onIntent = (e: Event) => {
      if (waLink(e.target) && isPublicPage()) prefetchLeadToken()
    }
    // Token listo antes del primer clic (en el celular, al abrir WhatsApp la pestaña se congela).
    const warmUp = window.setTimeout(() => {
      if (isPublicPage()) prefetchLeadToken()
    }, 1500)
    document.addEventListener("click", onClick)
    document.addEventListener("pointerover", onIntent)
    document.addEventListener("focusin", onIntent)
    return () => {
      window.clearTimeout(warmUp)
      document.removeEventListener("click", onClick)
      document.removeEventListener("pointerover", onIntent)
      document.removeEventListener("focusin", onIntent)
    }
  }, [])

  return null
}
