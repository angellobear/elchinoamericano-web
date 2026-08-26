import type { Metadata } from "next"
import Link from "next/link"
import { guias, CATEGORIAS, type GuiaCategoria } from "@/data/guias"
import { SITE_NAME, SITE_URL, buildCatalogMetadata } from "@/lib/seo"

export const metadata: Metadata = buildCatalogMetadata(
  `Centro de Ayuda — Guías de Repuestos Automotrices | ${SITE_NAME}`,
  "Guías prácticas sobre repuestos automotrices en Ecuador: diagnóstico de fallas, guías de compra y mantenimiento para vehículos chinos y americanos.",
  "/guias",
  {
    extraKeywords: [
      "guías repuestos Ecuador",
      "diagnóstico fallas auto Ecuador",
      "mantenimiento vehículos chinos Ecuador",
    ],
  },
)

const categorias = Object.entries(CATEGORIAS) as [GuiaCategoria, { label: string; descripcion: string }][]

export default function GuiasIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Inicio</Link>
        <span className="mx-2">/</span>
        <span>Guías</span>
      </nav>

      <h1 className="mb-3 text-3xl font-bold text-navy">Centro de Ayuda</h1>
      <p className="mb-10 text-lg text-gray-600">
        Guías prácticas sobre diagnóstico, compra y mantenimiento de repuestos automotrices
        para vehículos chinos y americanos en Ecuador.
      </p>

      {categorias.map(([cat, info]) => {
        const guiasCat = guias.filter((g) => g.categoria === cat)
        if (guiasCat.length === 0) return null
        return (
          <section key={cat} className="mb-12">
            <h2 className="mb-1 text-xl font-semibold text-navy">{info.label}</h2>
            <p className="mb-4 text-sm text-gray-500">{info.descripcion}</p>
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {guiasCat.map((guia) => (
                <li key={guia.slug}>
                  <Link
                    href={`/guias/${guia.categoria}/${guia.slug}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
                  >
                    <span className="text-navy font-medium">{guia.titulo}</span>
                    <span className="ml-4 shrink-0 text-gray-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </main>
  )
}
