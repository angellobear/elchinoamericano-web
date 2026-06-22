"use client";

import { useState, useMemo } from "react";

const WHATSAPP = "593984878153";

const CATEGORIES = [
  { id: "all", label: "Todo" },
  { id: "motor", label: "Motor" },
  { id: "frenos", label: "Frenos" },
  { id: "suspension", label: "Suspensión" },
  { id: "filtros", label: "Filtros" },
  { id: "carroceria", label: "Carrocería" },
  { id: "enfriamiento", label: "Enfriamiento" },
];

const CAR_BRANDS = [
  { id: "all", label: "Todas las marcas" },
  { id: "chery", label: "Chery" },
  { id: "great_wall", label: "Great Wall" },
  { id: "dfsk", label: "DFSK" },
  { id: "jetour", label: "Jetour" },
  { id: "shineray", label: "Shineray" },
  { id: "byd", label: "BYD" },
  { id: "mg", label: "MG" },
  { id: "jac", label: "JAC" },
  { id: "ford", label: "Ford" },
  { id: "chevrolet", label: "Chevrolet" },
];

interface Product {
  id: number;
  name: string;
  brand_product: string;
  compatible: string;
  category: string;
  car_brand: string;
  type: "original" | "alterno";
  price: number;
  icon: string;
}

const products: Product[] = [
  { id: 1, name: "Filtro de aceite", brand_product: "Bosch", compatible: "Chery Tiggo 2 · 2018-23", category: "filtros", car_brand: "chery", type: "original", price: 12.5, icon: "⚙️" },
  { id: 2, name: "Pastillas de freno delanteras", brand_product: "Brembo", compatible: "Great Wall Wingle 5 · 2015-20", category: "frenos", car_brand: "great_wall", type: "alterno", price: 38.0, icon: "🛑" },
  { id: 3, name: "Amortiguador trasero", brand_product: "KYB", compatible: "DFSK Glory 580 · 2020-23", category: "suspension", car_brand: "dfsk", type: "original", price: 95.0, icon: "🔧" },
  { id: 4, name: "Correa de distribución", brand_product: "Gates", compatible: "BYD F3 · 2010-15", category: "motor", car_brand: "byd", type: "alterno", price: 45.0, icon: "⛓️" },
  { id: 5, name: "Radiador", brand_product: "Mahle", compatible: "Chery QQ · 2008-14", category: "enfriamiento", car_brand: "chery", type: "original", price: 120.0, icon: "🌡️" },
  { id: 6, name: "Espejo retrovisor derecho", brand_product: "OEM", compatible: "Jetour X70 · 2021-23", category: "carroceria", car_brand: "jetour", type: "alterno", price: 55.0, icon: "🪞" },
  { id: 7, name: "Filtro de aire", brand_product: "Mann", compatible: "MG HS · 2020-23", category: "filtros", car_brand: "mg", type: "original", price: 18.0, icon: "💨" },
  { id: 8, name: "Disco de freno delantero", brand_product: "Ferodo", compatible: "Ford Ranger 2.5 · 2018-22", category: "frenos", car_brand: "ford", type: "original", price: 65.0, icon: "⭕" },
  { id: 9, name: "Bujía iridium (x4)", brand_product: "NGK", compatible: "Chevrolet Sail · 2012-18", category: "motor", car_brand: "chevrolet", type: "original", price: 32.0, icon: "⚡" },
  { id: 10, name: "Rótula de dirección", brand_product: "Moog", compatible: "Great Wall Haval H6 · 2016-21", category: "suspension", car_brand: "great_wall", type: "alterno", price: 28.0, icon: "🔩" },
  { id: 11, name: "Termostato", brand_product: "Wahler", compatible: "JAC J5 · 2013-18", category: "enfriamiento", car_brand: "jac", type: "original", price: 22.0, icon: "🌡️" },
  { id: 12, name: "Guardafango delantero izq.", brand_product: "OEM", compatible: "Shineray X30 · 2017-22", category: "carroceria", car_brand: "shineray", type: "alterno", price: 85.0, icon: "🚗" },
];

function IconBox({ icon, category }: { icon: string; category: string }) {
  const colors: Record<string, string> = {
    motor: "bg-amber-100 text-amber-700",
    frenos: "bg-red-100 text-red-700",
    suspension: "bg-blue-100 text-blue-700",
    filtros: "bg-green-100 text-green-700",
    carroceria: "bg-purple-100 text-purple-700",
    enfriamiento: "bg-cyan-100 text-cyan-700",
  };
  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[category] ?? "bg-slate-100"}`}>
      {icon}
    </div>
  );
}

function WhatsAppButton({ product }: { product: Product }) {
  const msg = encodeURIComponent(
    `Hola! Estoy interesado en:\n*${product.name}* (${product.brand_product})\nCompatible: ${product.compatible}\nPrecio: $${product.price.toFixed(2)}`
  );
  return (
    <a
      href={`https://wa.me/${WHATSAPP}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-white text-sm font-semibold transition-colors duration-200 cursor-pointer"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      Pedir por WhatsApp
    </a>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between gap-3">
        <IconBox icon={product.icon} category={product.category} />
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.type === "original" ? "bg-[#0d1f3c]/10 text-[#0d1f3c]" : "bg-slate-100 text-slate-600"}`}>
          {product.type === "original" ? "Original" : "Alterno"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-slate-900 leading-snug">{product.name}</h3>
        <p className="text-sm text-slate-500">{product.brand_product}</p>
        <p className="text-xs text-slate-400 mt-1">{product.compatible}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
        <span className="text-xl font-bold text-[#e03030]">${product.price.toFixed(2)}</span>
      </div>
      <WhatsAppButton product={product} />
    </article>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [carBrand, setCarBrand] = useState("all");
  const [productType, setProductType] = useState<"all" | "original" | "alterno">("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.compatible.toLowerCase().includes(search.toLowerCase()) ||
        p.brand_product.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "all" || p.category === category;
      const matchBrand = carBrand === "all" || p.car_brand === carBrand;
      const matchType = productType === "all" || p.type === productType;
      return matchSearch && matchCategory && matchBrand && matchType;
    });
  }, [search, category, carBrand, productType]);

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0d1f3c]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <svg className="w-7 h-7 text-[#e03030]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-white font-bold text-lg leading-tight">
              El Chino<br />
              <span className="text-[#e03030] text-sm font-semibold">Americano</span>
            </span>
          </div>

          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Buscar repuesto, marca, vehículo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 text-white placeholder-slate-400 rounded-xl border border-white/20 focus:outline-none focus:border-[#e03030] text-sm transition-colors duration-200"
              />
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="hidden sm:inline">Contactar</span>
          </a>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Buscar repuesto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 text-white placeholder-slate-400 rounded-xl border border-white/20 focus:outline-none focus:border-[#e03030] text-sm transition-colors duration-200"
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0d1f3c] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              Repuestos para vehículos<br />
              <span className="text-[#e03030]">chinos y americanos</span>
            </h1>
            <p className="mt-3 text-slate-400 text-base max-w-md">
              Originales y alternos. Entrega en Quito y envíos a nivel nacional.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#25D366] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Entrega en Quito Norte, Sur y Valles
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#25D366] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Envíos a nivel nacional
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#25D366] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Santo Domingo incluido
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  category === cat.id
                    ? "bg-[#0d1f3c] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <select
              value={carBrand}
              onChange={(e) => setCarBrand(e.target.value)}
              className="shrink-0 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[#0d1f3c] cursor-pointer"
            >
              {CAR_BRANDS.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              {(["all", "original", "alterno"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setProductType(t)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    productType === t
                      ? "bg-[#e03030] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t === "all" ? "Todos" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <span className="ml-auto shrink-0 text-sm text-slate-400">
              {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-medium">No encontramos resultados</p>
            <p className="text-sm">Prueba con otros filtros o{" "}
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-[#e03030] hover:underline cursor-pointer">
                consulta por WhatsApp
              </a>
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0d1f3c] text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-[#e03030]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-white font-bold">El Chino Americano</span>
            </div>
            <p className="text-sm max-w-xs">
              Especialistas en repuestos para vehículos de marcas chinas y americanas en Ecuador.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-white font-semibold mb-1">Contacto</p>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 cursor-pointer">
              WhatsApp: 098 487 8153
            </a>
            <p>Cobertura: Quito · Santo Domingo · Nacional</p>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 sm:px-6 py-4">
          <p className="text-xs text-center text-slate-600">
            © {new Date().getFullYear()} El Chino Americano. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}
