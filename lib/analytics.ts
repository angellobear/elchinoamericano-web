// ponytail: un solo evento GA4 para todos los botones de WhatsApp.
// La ciudad/pais los agrega GA4 automaticamente (dimensiones geo), no hay que enviarlos.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Envia el evento `whatsapp_click` a GA4. `source` identifica el boton/seccion. */
export function trackWhatsApp(source: string, item?: string) {
  // En dev no hay gtag: log para poder verificar que cada boton manda su source.
  if (process.env.NODE_ENV !== "production") console.log("[wa]", source, item ?? "")
  window.gtag?.("event", "whatsapp_click", {
    wa_source: source,
    wa_item: item,
    wa_page: window.location.pathname,
  })
}

/** Envia el evento `lead_submit` a GA4 cuando un lead queda guardado en la bandeja. */
export function trackLead(source: "repuesto" | "carrito") {
  if (process.env.NODE_ENV !== "production") console.log("[lead]", source)
  window.gtag?.("event", "lead_submit", { lead_source: source, wa_page: window.location.pathname })
}
