'use client'

import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface Props {
  name: string
  currentUrl?: string | null
  currentPublicId?: string | null
  label?: string
}

// Componente controlado: el padre debe llamar uploadPendingImage() antes de guardar
// Aquí solo maneja el preview local. El upload real ocurre en el submit del form.
export function ImageUploadField({ name, currentUrl, currentPublicId, label = 'Imagen' }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = removed ? null : (preview ?? currentUrl)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Hidden fields para que el server action los reciba */}
      <input type="hidden" name={`${name}_current_url`} value={removed ? '' : (currentUrl ?? '')} />
      <input type="hidden" name={`${name}_public_id`} value={removed ? '' : (currentPublicId ?? '')} />
      <input type="hidden" name={`${name}_removed`} value={removed ? '1' : '0'} />

      <div
        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 cursor-pointer hover:border-gray-300 transition-colors"
        style={{ minHeight: 120 }}
        onClick={() => inputRef.current?.click()}
      >
        {displayUrl ? (
          <>
            <div className="relative w-full h-32">
              {/* ponytail: img normal evita config de dominio Next.js para previews de Cloudinary */}
              <img src={displayUrl} alt="Preview" className="w-full h-full object-contain p-2" />
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setRemoved(true); setPreview(null) }}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-gray-500 hover:text-red-500"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
            <ImagePlus size={28} />
            <span className="text-xs">Haz click para seleccionar</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) {
            setRemoved(false)
            setPreview(URL.createObjectURL(file))
          }
        }}
      />
      <p className="text-xs text-gray-400">La imagen se sube al guardar el formulario</p>
    </div>
  )
}
