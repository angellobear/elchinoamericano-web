"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Search, Truck } from "lucide-react"
import type { Product } from "@/types"

const PREVIEW = 5

type Compatibility = NonNullable<Product["compatibilities"]>[number]

export default function CompatibilityTable({ items }: { items: Compatibility[] }) {
  const [query, setQuery] = useState("")
  const [showAll, setShowAll] = useState(false)

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const ba = a.model?.brand?.name ?? ""
        const bb = b.model?.brand?.name ?? ""
        return ba !== bb ? ba.localeCompare(bb) : (a.model?.name ?? "").localeCompare(b.model?.name ?? "")
      }),
    [items],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((c) =>
      [c.model?.brand?.name, c.model?.name, c.model?.displacement, c.notes]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    )
  }, [sorted, query])

  const visible = showAll || query ? filtered : filtered.slice(0, PREVIEW)
  const dash = <span className="text-[#c8d0db]">-</span>

  return (
    <div>
      {sorted.length > PREVIEW && (
        <div className="relative mb-4 max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a93a3]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar marca o modelo..."
            className="w-full rounded-full border border-[#e6e9ef] bg-white py-2.5 pl-10 pr-4 text-3.5 text-navy transition-colors placeholder:text-[#8a93a3] focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
          />
        </div>
      )}

      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[#e6e9ef] bg-white">
        <table className="w-full min-w-140 text-left">
          <thead>
            <tr className="bg-navy">
              {(["Marca", "Modelo", "Cilindraje", "Años"] as const).map((h, i) => (
                <th
                  key={h}
                  className={`py-3 text-2.75 font-semibold uppercase tracking-[.08em] text-white ${i === 0 ? "pl-5 pr-4" : i === 3 ? "pl-4 pr-5" : "px-4"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((c, idx) => (
              <tr
                key={`${c.vehicle_model_id}-${idx}`}
                className="border-b border-[#ebeef3] transition-colors last:border-b-0 hover:bg-[#f8fafc]"
              >
                <td className="pl-5 pr-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e6e9ef] bg-[#f8fafc]">
                      {c.model?.brand?.logo_url ? (
                        <Image
                          src={c.model.brand.logo_url}
                          alt={c.model.brand.name}
                          width={44}
                          height={44}
                          className="h-7 w-7 object-contain"
                        />
                      ) : (
                        <Truck size={16} className="text-[#c8d0db]" />
                      )}
                    </span>
                    <span className="text-3.5 font-semibold uppercase text-navy">
                      {c.model?.brand?.name ?? dash}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-3.75 font-semibold uppercase text-navy">{c.model?.name}</span>
                  {c.notes && <span className="ml-1.5 text-3 text-[#8a93a3]">({c.notes})</span>}
                </td>
                <td className="px-4 py-3.5 text-3.5 text-[#566071]">{c.model?.displacement ?? dash}</td>
                <td className="pl-4 pr-5 py-3.5 text-3.5 text-[#566071]">
                  {c.model?.year_start || c.model?.year_end
                    ? `${c.model?.year_start ?? ""}-${c.model?.year_end ?? "actual"}`
                    : dash}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-3.5 text-[#8a93a3]">
                  No encontramos vehiculos con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!showAll && !query && filtered.length > PREVIEW && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="ml-auto mt-5 flex cursor-pointer items-center rounded-full border border-navy px-6 py-2.5 text-3.5 font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
        >
          Mostrar todos ({filtered.length})
        </button>
      )}
    </div>
  )
}
