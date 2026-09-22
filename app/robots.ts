import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

const PRIVATE_PATHS = ["/admin/", "/api/", "/login/"]

export default function robots(): MetadataRoute.Robots {
  return {
    // ponytail: cada grupo con user-agent propio reemplaza a "*", así que el disallow va en todos
    rules: ["*", "Googlebot", "Bingbot", "GPTBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "CCBot", "Google-Extended"].map(
      (userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE_PATHS }),
    ),
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
