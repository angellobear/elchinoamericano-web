import Link from "next/link"
import { buildCatalogBrandPath, buildCatalogModelPath, MIN_INDEXABLE_MODEL_PRODUCTS } from "@/lib/catalog"
import type { VehicleModelGroup } from "@/lib/vehicle-models"

// Ford es la marca con más repuestos del catálogo: sección propia en el home para que Google
// asocie "El Chino Americano" también con Ford (el nombre suena solo a marcas chinas).
export default function FordSpotlight({ models, total }: { models: VehicleModelGroup[]; total: number }) {
  const featured = models.filter((m) => m.products.length >= MIN_INDEXABLE_MODEL_PRODUCTS).slice(0, 8)
  if (featured.length === 0) return null

  return (
    <section aria-labelledby="ford-heading" className="border-t border-[#e6e9ef] bg-[#f6f8fb]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.75 h-1.75 rounded-full bg-brand" />
            <span className="text-3.25 font-semibold uppercase tracking-[.16em] text-brand">Lo americano</span>
          </div>
          <h2 id="ford-heading" className="font-display text-8 font-bold uppercase leading-none text-navy">
            Especialistas en repuestos Ford
          </h2>
          <p className="mt-4 text-3.75 leading-[1.65] text-[#566071]">
            Somos &quot;El Chino&quot; por las marcas chinas y &quot;Americano&quot; por Ford y Chevrolet. Ford es la marca
            con más repuestos en nuestro catálogo: {total} piezas originales, OEM y alternas para Explorer, Ranger,
            Escape, EcoSport y más, con envío a todo Ecuador desde Quito.
          </p>
          <Link
            href={buildCatalogBrandPath(["ford"])}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-3.5 font-semibold text-white transition-colors hover:bg-brand/90"
          >
            Ver repuestos Ford →
          </Link>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {featured.map((model) => (
            <li key={model.key}>
              <Link
                href={buildCatalogModelPath("ford", model.slug)}
                className="flex h-full flex-col rounded-[14px] border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand"
              >
                <span className="font-display text-5 font-bold uppercase leading-none text-navy">{model.name}</span>
                <span className="mt-1.5 text-3.25 text-[#8a93a3]">{model.products.length} repuestos</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
