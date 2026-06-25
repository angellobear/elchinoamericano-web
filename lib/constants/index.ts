import { businessName } from "./site"
import { contactInfo, getWhatsAppUrl } from "./contact"
import { socialLinks } from "./social"

export const siteConfig = {
  businessName,
  contact: contactInfo,
  social: socialLinks,
} as const

export { businessName, contactInfo, getWhatsAppUrl, socialLinks }
