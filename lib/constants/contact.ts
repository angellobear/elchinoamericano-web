export const contactInfo = {
  whatsappNumber: "593984878153",
  whatsappDisplay: "+593 984 878 153",
  address: {
    city: "Santo Domingo de los Tsáchilas",
    country: "Ecuador",
    full: "Santo Domingo de los Tsáchilas, Ecuador",
  },
  hours: {
    display: "Lun–Sáb · 8:00–18:00",
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