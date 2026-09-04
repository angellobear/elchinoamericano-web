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
