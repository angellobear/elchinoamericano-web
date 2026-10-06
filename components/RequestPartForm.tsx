"use client"

import { useState, useTransition } from "react"
import { PackageSearch, Send, ChevronDown } from "lucide-react"
import { getWhatsAppUrl } from "@/lib/constants"
import { trackLead, trackWhatsApp } from "@/lib/analytics"
import { submitInboxMessage } from "@/modules/inbox/server/actions"
import type { ActionResult } from "@/modules/admin/shared/types/action-result"

interface RequestPartFormProps {
  searchQuery?: string
  /** Se llama cuando el lead quedó guardado; el catálogo limpia filtros y muestra la confirmación. */
  onSubmitted: () => void
}

interface FormData {
  repuesto: string
  marcaVehiculo: string
  modelo: string
  anio: string
  cilindraje: string
  nombre: string
  telefono: string
  nota: string
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 25 }, (_, i) => CURRENT_YEAR - i)

function buildWaMessage(form: FormData) {
  const vehiculoStr = [form.marcaVehiculo, form.modelo, form.anio, form.cilindraje].filter(Boolean).join(" ")
  return [
    `Hola! Necesito un repuesto que no encuentro en el catálogo.`,
    ``,
    `🔧 Repuesto necesario: ${form.repuesto}`,
    vehiculoStr && `🚗 Vehículo: ${vehiculoStr}`,
    ``,
    `📋 Mis datos:`,
    `• Nombre: ${form.nombre}`,
    form.telefono && `• Teléfono: ${form.telefono}`,
    form.nota && ``,
    form.nota && `📝 Nota adicional: ${form.nota}`,
    ``,
    `¿Pueden ayudarme a conseguirlo?`,
  ].join("\n")
}

export default function RequestPartForm({ searchQuery = "", onSubmitted }: RequestPartFormProps) {
  const [form, setForm] = useState<FormData>({
    repuesto: searchQuery,
    marcaVehiculo: "",
    modelo: "",
    anio: "",
    cilindraje: "",
    nombre: "",
    telefono: "",
    nota: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [website, setWebsite] = useState("")
  const [pending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result: ActionResult = await submitInboxMessage({
        type: "part_request",
        name: form.nombre,
        phone: form.telefono,
        website,
        payload: {
          repuesto: form.repuesto,
          marcaVehiculo: form.marcaVehiculo,
          modelo: form.modelo,
          anio: form.anio,
          cilindraje: form.cilindraje,
          nota: form.nota,
          searchQuery,
        },
      }).catch(() => ({ ok: false, message: "No pudimos enviar tu solicitud. Revisa tu conexión." }))

      if (!result.ok) {
        setError(result.message)
        return
      }
      trackLead("repuesto")
      onSubmitted()
    })
  }

  function openWhatsApp() {
    trackWhatsApp("catalogo")
    window.open(getWhatsAppUrl(buildWaMessage(form)), "_blank")
  }

  const isValid = form.repuesto.trim() && form.nombre.trim() && form.marcaVehiculo.trim() && form.telefono.trim()

  return (
    <div className="flex flex-col gap-8">
      {/* No results header */}
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
          <PackageSearch size={28} className="text-slate-400" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-display font-bold text-slate-800 text-xl">
            No encontramos ese repuesto
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}". Igual podemos conseguirlo.`
              : "Intenta con otros filtros, o solicítanos el repuesto directamente."}
          </p>
        </div>
      </div>

      {/* Divider with CTA */}
      <div className="bg-navy rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-display font-bold text-white text-lg leading-tight">
            Lo buscamos por ti
          </p>
          <p className="text-white/60 text-sm">
            Déjanos tus datos y un asesor te contacta.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        {/* Repuesto needed */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="req-repuesto" className="text-sm font-bold text-slate-700">
            ¿Qué repuesto necesitas? <span className="text-brand">*</span>
          </label>
          <input
            id="req-repuesto"
            name="repuesto"
            type="text"
            required
            value={form.repuesto}
            onChange={handleChange}
            placeholder="Ej: Filtro de aceite, amortiguador delantero, sensor de oxígeno..."
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
          />
        </div>

        {/* Vehicle info */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
            Datos del vehículo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="req-marca" className="text-sm font-semibold text-slate-700">
                Marca <span className="text-brand">*</span>
              </label>
              <input
                id="req-marca"
                name="marcaVehiculo"
                type="text"
                required
                value={form.marcaVehiculo}
                onChange={handleChange}
                placeholder="Ej: Chery, Ford, SWM..."
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="req-modelo" className="text-sm font-semibold text-slate-700">
                Modelo
              </label>
              <input
                id="req-modelo"
                name="modelo"
                type="text"
                value={form.modelo}
                onChange={handleChange}
                placeholder="Ej: Tiggo 5, F-150, Song Plus..."
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="req-anio" className="text-sm font-semibold text-slate-700">
                Año
              </label>
              <div className="relative">
                <select
                  id="req-anio"
                  name="anio"
                  value={form.anio}
                  onChange={handleChange}
                  className="w-full appearance-none px-3 py-2.5 pr-9 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors bg-white text-slate-700"
                >
                  <option value="">Seleccionar año</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="req-cilindraje" className="text-sm font-semibold text-slate-700">
                Cilindraje
              </label>
              <input
                id="req-cilindraje"
                name="cilindraje"
                type="text"
                value={form.cilindraje}
                onChange={handleChange}
                placeholder="Ej: 1.5T, 2.0, 3.5L V6..."
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
            Tus datos de contacto
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="req-nombre" className="text-sm font-semibold text-slate-700">
                Nombre <span className="text-brand">*</span>
              </label>
              <input
                id="req-nombre"
                name="nombre"
                type="text"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="req-telefono" className="text-sm font-semibold text-slate-700">
                Teléfono / WhatsApp <span className="text-brand">*</span>
              </label>
              <input
                id="req-telefono"
                name="telefono"
                type="tel"
                required
                value={form.telefono}
                onChange={handleChange}
                placeholder="+593 9XX XXX XXX"
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Optional note */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="req-nota" className="text-sm font-semibold text-slate-700">
            Nota adicional
          </label>
          <textarea
            id="req-nota"
            name="nota"
            rows={2}
            value={form.nota}
            onChange={handleChange}
            placeholder="Urgencia, número de referencia OEM, o cualquier detalle que nos ayude..."
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors resize-none"
          />
        </div>

        {error && (
          <div role="alert" className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={openWhatsApp} className="self-start font-semibold text-wa hover:text-wa/80">
              Enviar por WhatsApp
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || pending}
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3.5 rounded-lg transition-colors duration-150 active:scale-[0.97] min-h-12 w-full sm:w-auto"
        >
          <Send size={16} />
          {pending ? "Enviando…" : "Enviar solicitud"}
        </button>

        <p className="text-xs text-slate-400">
          Campos con <span className="text-brand font-semibold">*</span> son obligatorios.
          Respondemos en &lt; 24h en días laborables.
        </p>
      </form>
    </div>
  )
}
