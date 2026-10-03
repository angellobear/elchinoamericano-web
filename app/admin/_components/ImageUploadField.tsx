'use client'

import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { compressImage } from '@/lib/compress-image'

interface Props {
  name: string
  currentUrl?: string | null
  currentPublicId?: string | null
  label?: string
  /** Reduce la foto en el navegador antes de subirla (fotos de teléfono). Sin esto, se sube tal cual. */
  compress?: boolean
}

// Componente controlado: el padre debe llamar uploadPendingImage() antes de guardar
// Aquí solo maneja el preview local. El upload real ocurre en el submit del form.
export function ImageUploadField({ name, currentUrl, currentPublicId, label = 'Imagen', compress = false }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
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
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs and remote previews keep this field simple without forcing next/image config */}
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
        onChange={async e => {
          const input = e.currentTarget
          const file = input.files?.[0]
          if (!file) return

          setRemoved(false)
          setPreview(URL.createObjectURL(file))
          if (!compress) return

          // Se reemplaza el archivo del input por la versión reducida: es la que viaja al guardar.
          setOptimizing(true)
          const smaller = await compressImage(file)
          if (smaller !== file) {
            const transfer = new DataTransfer()
            transfer.items.add(smaller)
            input.files = transfer.files
          }
          setOptimizing(false)
        }}
      />
      <p className="text-xs text-gray-400">
        {optimizing ? 'Optimizando foto…' : 'La imagen se sube al guardar el formulario'}
      </p>
    </div>
  )
}
