import Link from "next/link"
import { buildCatalogBrandPath } from "@/lib/catalog"
import type { PublicVehicleBrand } from "@/lib/vehicle-brands-public"

function BrandCard({ brand }: { brand: PublicVehicleBrand }) {
  const hasImage = Boolean(brand.image.url)

  return (
    <Link
      href={buildCatalogBrandPath([brand.key])}
      title={`Ver repuestos para ${brand.name}`}
      className="reveal-in h-28 rounded-[14px] bg-[#13294a] border border-white/10 grid place-items-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-brand hover:shadow-[0_16px_34px_rgba(0,0,0,.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {hasImage ? (
        <img
          src={brand.image.url ?? ""}
          alt={`Logo de ${brand.name}`}
          title={brand.name}
          loading="lazy"
          decoding="async"
          className="size-20 object-cover "
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-20 place-items-center rounded-full border border-white/12 bg-white/6 font-display text-5 font-bold text-white"
        >
          {brand.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="font-display font-bold text-5 -mt-11 text-white leading-none tracking-[.04em]">
        {brand.name.toUpperCase()}
      </span>
    </Link>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-8.5 mb-4">
      <h3 className="font-display font-semibold text-4 uppercase tracking-[.14em] text-[#9fb0c8] shrink-0">
        {label}
      </h3>
      <span className="flex-1 h-px bg-white/10" />
    </div>
  )
}

interface BrandsProps {
  brands: PublicVehicleBrand[]
}

export default function Brands({ brands }: BrandsProps) {
  const chineseBrands = brands.filter((brand) => brand.origin === "chinese")
  const americanBrands = brands.filter((brand) => brand.origin === "american")

  return (
    <section id="marcas" className="bg-navy-dark py-[84px]" aria-labelledby="brands-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reveal-in text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="w-1.75 h-1.75 rounded-full bg-brand" />
            <span className="text-3.25 font-semibold uppercase tracking-[.16em] text-brand">Marcas</span>
          </div>
          <h2 id="brands-title" className="font-display font-bold text-[#f4f7fb] uppercase leading-none text-[clamp(2rem,4.5vw,3.25rem)]">
            Especialistas en marcas chinas y americanas
          </h2>
        </div>

        {/* Chinese brands */}
        <div>
          <Divider label="Marcas chinas" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {chineseBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
            <div className="reveal-in h-28 rounded-[14px] bg-[#13294a] border border-white/10 flex items-center justify-center">
              <span className="font-display font-semibold text-4.25 text-[#9fb0c8] text-center leading-snug">
                y más<br />marcas
              </span>
            </div>
          </div>
        </div>

        {/* American brands */}
        <div>
          <Divider label="Marcas americanas" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {americanBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
            <div className="reveal-in h-28 rounded-[14px] bg-[#13294a] border border-white/10 flex items-center justify-center">
              <span className="font-display font-semibold text-4.25 text-[#9fb0c8] text-center leading-snug">
                y más<br />marcas
              </span>
            </div>
            <div className="reveal-in h-28 rounded-[14px] border border-dashed border-brand/45 bg-gradient-to-br from-brand/16 to-brand/4 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
              <span className="font-display font-bold text-4.25 uppercase text-white leading-tight">
                ¿Otra marca?
              </span>
              <span className="text-3 text-[#9fb0c8]">Consúltanos por WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
