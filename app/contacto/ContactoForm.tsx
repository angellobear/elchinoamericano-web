"use client"

import { useState } from "react"
import { CheckCircle, MessageCircle, Send } from "lucide-react"

const BUSINESS_EMAIL = "pedidos@elchinoamericano.com"

interface FormData {
  nombre: string
  telefono: string
  vehiculo: string
  repuesto: string
  mensaje: string
}

export default function ContactoForm() {
  const [form, setForm] = useState<FormData>({
    nombre: "",
    telefono: "",
    vehiculo: "",
    repuesto: "",
    mensaje: "",
  })
  const [sent, setSent] = useState(false)

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((previousForm) => ({
      ...previousForm,
      [event.target.name]: event.target.value,
    }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const subject = `Consulta de repuesto — ${form.repuesto} | ${form.nombre}`
    const body = [
      `Nombre: ${form.nombre}`,
      form.telefono ? `Teléfono / WhatsApp: ${form.telefono}` : null,
      form.vehiculo ? `Modelo del vehículo: ${form.vehiculo}` : null,
      `Repuesto necesario: ${form.repuesto}`,
      form.mensaje ? `\nMensaje adicional:\n${form.mensaje}` : null,
      `\n---\nEnviado desde el formulario de contacto de elchinoamericano.com`,
    ]
      .filter(Boolean)
      .join("\n")

    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
    setTimeout(() => setSent(false), 5000)
  }

  const isValid = form.nombre.trim() && form.repuesto.trim()

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center bg-slate-50 rounded-2xl">
        <CheckCircle size={48} className="text-emerald-600" />
        <div>
          <p className="font-semibold text-slate-800 text-lg">
            ¡Tu cliente de correo se abrió!
          </p>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Si no se abrió automáticamente, escríbenos directamente a{" "}
            <a
              href={`mailto:${BUSINESS_EMAIL}`}
              className="text-navy font-semibold underline"
            >
              {BUSINESS_EMAIL}
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className="text-sm font-semibold text-slate-700">
            Nombre <span className="text-brand">*</span>
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            value={form.nombre}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefono" className="text-sm font-semibold text-slate-700">
            Teléfono / WhatsApp
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleChange}
            placeholder="+593 9XX XXX XXX"
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="vehiculo" className="text-sm font-semibold text-slate-700">
          Modelo del vehículo
        </label>
        <input
          id="vehiculo"
          name="vehiculo"
          type="text"
          value={form.vehiculo}
          onChange={handleChange}
          placeholder="Ej: Chery Tiggo 5 2.0 2020"
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="repuesto" className="text-sm font-semibold text-slate-700">
          Repuesto que necesitas <span className="text-brand">*</span>
        </label>
        <input
          id="repuesto"
          name="repuesto"
          type="text"
          required
          value={form.repuesto}
          onChange={handleChange}
          placeholder="Ej: Filtro de aceite, pastillas de freno..."
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mensaje" className="text-sm font-semibold text-slate-700">
          Mensaje adicional
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          value={form.mensaje}
          onChange={handleChange}
          placeholder="Detalles adicionales, urgencia, o cualquier pregunta..."
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-1">
        <button
          type="submit"
          disabled={!isValid}
          className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3.5 rounded-md transition-colors duration-150 active:scale-[0.98] min-h-[48px]"
        >
          <Send size={16} />
          Enviar por correo
        </button>
        <a
          href={`https://wa.me/593984878153?text=${encodeURIComponent(`Hola! Soy ${form.nombre || "un cliente"}. Necesito el repuesto: ${form.repuesto || "..."} para mi vehículo ${form.vehiculo || ""}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-wa hover:bg-wa/90 text-white font-bold text-sm px-6 py-3.5 rounded-md transition-colors duration-150 active:scale-[0.98] min-h-[48px]"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </div>
    </form>
  )
}
