import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/catalogo", "/catalogo/", "/catalogo/marca/", "/contacto"],
        disallow: ["/admin/", "/api/", "/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
