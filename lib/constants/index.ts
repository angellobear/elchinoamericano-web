import { businessName, SITE_NAME, SITE_URL, SITE_LOCALE } from "./site"
import { contactInfo, contactPageContent, getWhatsAppUrl } from "./contact"
import { homeContent } from "./home"
import { socialLinks } from "./social"

export const siteConfig = {
  businessName,
  contact: contactInfo,
  home: homeContent,
  social: socialLinks,
} as const

export {
  businessName,
  SITE_NAME,
  SITE_URL,
  SITE_LOCALE,
  contactInfo,
  contactPageContent,
  getWhatsAppUrl,
  homeContent,
  socialLinks,
}
