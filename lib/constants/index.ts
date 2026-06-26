import { businessName } from "./site"
import { contactInfo, getWhatsAppUrl } from "./contact"
import { homeContent } from "./home"
import { socialLinks } from "./social"

export const siteConfig = {
  businessName,
  contact: contactInfo,
  home: homeContent,
  social: socialLinks,
} as const

export { businessName, contactInfo, getWhatsAppUrl, homeContent, socialLinks }
