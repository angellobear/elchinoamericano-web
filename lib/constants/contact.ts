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
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63920.12895556985!2d-79.20380!3d-0.24986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d584d74820e3f3%3A0x1d25fcb87a7e06e!2sSanto%20Domingo%20de%20los%20Ts%C3%A1chilas%2C%20Ecuador!5e0!3m2!1ses!2sec!4v1750620000000!5m2!1ses!2sec",
    title: "Ubicación El Chino Americano — Santo Domingo de los Tsáchilas, Ecuador",
  },
} as const

export function getWhatsAppUrl(message?: string) {
  const baseUrl = `https://wa.me/${contactInfo.whatsappNumber}`
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl
}
