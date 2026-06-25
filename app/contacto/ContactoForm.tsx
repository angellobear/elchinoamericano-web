"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { getWhatsAppUrl } from "@/lib/constants"

const CAR_BRANDS = ["Chery", "SWM", "Great Wall", "DFSK", "Shineray", "JAC", "Jetour", "Ford", "Chevrolet"]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 20 }, (_, i) => String(CURRENT_YEAR - i))

interface Form {
  nombre: string
  whatsapp: string
  marca: string
  modelo: string
  anio: string
  repuesto: string
}

export default function ContactoForm() {
  const [form, setForm] = useState<Form>({
    nombre: "",
    whatsapp: "",
    marca: "",
    modelo: "",
    anio: "",
    repuesto: "",
  })

  function set(key: keyof Form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parts = [
      `Hola! Soy ${form.nombre}.`,
      form.marca || form.modelo || form.anio
        ? `Vehículo: ${[form.marca, form.modelo, form.anio].filter(Boolean).join(" ")}.`
        : null,
      `Repuesto que necesito: ${form.repuesto}.`,
      form.whatsapp ? `Mi WhatsApp: ${form.whatsapp}.` : null,
    ].filter(Boolean)
    window.open(getWhatsAppUrl(parts.join(" ")), "_blank", "noopener,noreferrer")
  }

  const isValid = form.nombre.trim() && form.repuesto.trim()

  const inputCls =
    "bg-[#f6f8fb] border border-[#dfe4ec] rounded-2.5 px-4 py-3 text-3.5 text-slate-700 placeholder:text-[#9aa3b2] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors w-full"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-3.25 font-semibold text-navy mb-2">
            Nombre <span className="text-brand">*</span>
          </label>
          <input type="text" required placeholder="Tu nombre" value={form.nombre} onChange={set("nombre")} className={inputCls} />
        </div>
        <div>
          <label className="block text-3.25 font-semibold text-navy mb-2">WhatsApp</label>
          <input type="tel" placeholder="+593 9X XXX XXXX" value={form.whatsapp} onChange={set("whatsapp")} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-3.25 font-semibold text-navy mb-2">Marca</label>
          <select value={form.marca} onChange={set("marca")} className={inputCls}>
            <option value="">Seleccionar</option>
            {CAR_BRANDS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-3.25 font-semibold text-navy mb-2">Modelo</label>
          <input type="text" placeholder="Ej: Tiggo 4" value={form.modelo} onChange={set("modelo")} className={inputCls} />
        </div>
        <div>
          <label className="block text-3.25 font-semibold text-navy mb-2">Año</label>
          <select value={form.anio} onChange={set("anio")} className={inputCls}>
            <option value="">Año</option>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-3.25 font-semibold text-navy mb-2">
          ¿Qué repuesto necesitas? <span className="text-brand">*</span>
        </label>
        <textarea
          required
          rows={4}
          placeholder="Ej: pastillas de freno delanteras, número de pieza si lo tienes..."
          value={form.repuesto}
          onChange={set("repuesto")}
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full inline-flex items-center justify-center gap-2.5 bg-wa hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed text-[#062b15] font-bold text-4 py-4 rounded-3 transition-all mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa"
      >
        <MessageCircle size={20} />
        Enviar por WhatsApp
      </button>
      <p className="text-center text-[12.5px] text-[#9aa3b2]">
        Se abrirá WhatsApp con tu consulta pre-llenada.
      </p>
    </form>
  )
}
