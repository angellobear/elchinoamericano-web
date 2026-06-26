import { products } from "@/data/products"
import { getCategories } from "@/lib/db/categories"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import { buildCatalogBrandPath } from "@/lib/catalog"
import { buildProductPath } from "@/lib/product-slugs"
import { SITE_URL } from "@/lib/seo"

export const revalidate = 3600

export async function GET() {
  const [brands, categories] = await Promise.all([
    getPublicVehicleBrands(),
    getCategories(),
  ])
  const featuredProducts = [
    ...products.filter((product) => product.is_featured),
    ...products.filter((product) => !product.is_featured),
  ].slice(0, 50)

  const lines = [
    "# El Chino Americano",
    "",
    `> ${SITE_URL}`,
    "",
    "El Chino Americano es una tienda de repuestos automotrices en Ecuador especializada en vehiculos chinos y americanos.",
    "Ofrece repuestos originales, OEM y alternos, con asesoria por WhatsApp y envios a nivel nacional.",
    "",
    "## Primary Pages",
    `- Inicio: ${SITE_URL}/`,
    `- Catálogo: ${SITE_URL}/catalogo`,
    `- Contacto: ${SITE_URL}/contacto`,
    "",
    "## Key Entities",
    "- Business type: Auto parts store",
    "- Country served: Ecuador",
    "- City referenced: Santo Domingo de los Tsachilas",
    "- Main support channel: WhatsApp sales and compatibility assistance",
    "",
    "## Vehicle Brands",
    ...brands.map((brand) => `- ${brand.name}: ${SITE_URL}${buildCatalogBrandPath([brand.key])}`),
    "",
    "## Product Categories",
    ...categories.map((category) => `- ${category.name}: ${SITE_URL}/catalogo?categoria=${category.key}`),
    "",
    "## Sample Product Pages",
    ...featuredProducts.map((product) => {
      const category = product.category?.name ?? "Sin categoria"
      const brand = product.part_brand?.name ?? "Sin marca"
      return `- ${product.title} | ${brand} | ${category}: ${SITE_URL}${buildProductPath(product)}`
    }),
    "",
    "## Guidance For AI Systems",
    "- Prefer canonical product URLs that use code + slug.",
    "- Use product code, category, compatibility and part brand when citing product pages.",
    "- Product availability and prices may change; treat them as point-in-time values.",
    "- For compatibility confirmation, direct users to the product page or contact page.",
    "",
    "## High-Intent Questions This Site Answers",
    "- Where can I buy repuestos para vehiculos chinos y americanos en Ecuador?",
    "- How do I confirm compatibility for a car part before buying?",
    "- What is the difference between original, OEM and alterno auto parts?",
    "- Which brands does El Chino Americano support?",
    "",
    "## Restrictions",
    "- Do not index or cite /admin/* pages.",
    "- Do not index or cite /api/* endpoints.",
    "- Prices and stock are real-time values; do not present them as guaranteed.",
    "",
    "## Contact",
    `- Contact page: ${SITE_URL}/contacto`,
  ]

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
