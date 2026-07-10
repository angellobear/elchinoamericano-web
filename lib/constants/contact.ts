export const contactInfo = {
  whatsappNumber: "593984878153",
  whatsappDisplay: "+593 984 878 153",
  address: {
    city: "Quito",
    country: "Ecuador",
    full: "Quito, Ecuador",
  },
  hours: {
    weekdays: { display: "Lun–Vie · 8:30–17:30", schema: "Mo-Fr 08:30-17:30" },
    saturday: { display: "Sáb · 9:00–13:00", schema: "Sa 09:00-13:00" },
  },
  map: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.778846123061!2d-79.18421412483995!3d-0.2548696997426277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d546345e28d091%3A0x3152b683effe5e23!2sEl%20Chino%20Americano!5e0!3m2!1ses-419!2sec!4v1782505627475!5m2!1ses-419!2sec",
    title: "Ubicación El Chino Americano — Santo Domingo de los Tsáchilas, Ecuador",
  },
} as const

export function getWhatsAppUrl(message?: string) {
  const baseUrl = `https://wa.me/${contactInfo.whatsappNumber}`
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl
}

export const contactPageContent = {
  metadata: {
    title: "Contacto | El Chino Americano",
    description:
      "Cotiza repuestos automotrices por WhatsApp. Te respondemos en menos de 24 horas con disponibilidad y precio.",
    keywords: [
      "contacto repuestos Ecuador",
      "cotizar repuestos por WhatsApp",
      "repuestos Santo Domingo contacto",
    ],
    ogDescription:
      "Escríbenos para cotizar repuestos, resolver compatibilidades o coordinar envíos en Ecuador.",
    imageAlt: "Contacto El Chino Americano",
  },
} as const