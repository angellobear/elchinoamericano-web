'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X } from 'lucide-react'


const MAX = 6

interface ExistingImage {
  url: string
  cloudinaryPublicId?: string | null
  isPrimary: boolean
  sortOrder: number
}

interface NewFile {
  file: File
  previewUrl: string
}

interface Props {
  existingImages?: ExistingImage[]
}

export function ProductImagesSection({ existingImages = [] }: Props) {
  const [kept, setKept]       = useState<ExistingImage[]>(existingImages)
  const [removed, setRemoved] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<NewFile[]>([])
  const [primaryIdx, setPrimaryIdx] = useState<number>(() => {
    const i = existingImages.findIndex(img => img.isPrimary)
    return i >= 0 ? i : 0
  })

  const triggerRef  = useRef<HTMLInputElement>(null)
  // one hidden file input per new file so FormData picks them up
  const fileRefs    = useRef<(HTMLInputElement | null)[]>([])

  const totalCount  = kept.length + newFiles.length
  const canAdd      = totalCount < MAX

  // Inject File objects into hidden inputs via DataTransfer
  useEffect(() => {
    newFiles.forEach((nf, i) => {
      const el = fileRefs.current[i]
      if (!el) return
      const dt = new DataTransfer()
      dt.items.add(nf.file)
      el.files = dt.files
    })
  }, [newFiles])

  function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files  = Array.from(e.target.files ?? [])
    const slots  = MAX - totalCount
    const toAdd  = files.slice(0, slots).map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))
    setNewFiles(p => [...p, ...toAdd])
    e.target.value = ''
  }

  function removeExisting(i: number) {
    const img = kept[i]
    if (img.cloudinaryPublicId) setRemoved(r => [...r, img.cloudinaryPublicId!])
    setKept(k => k.filter((_, idx) => idx !== i))
    if (primaryIdx === i) setPrimaryIdx(0)
    else if (primaryIdx > i) setPrimaryIdx(p => p - 1)
  }

  function removeNew(i: number) {
    URL.revokeObjectURL(newFiles[i].previewUrl)
    setNewFiles(f => f.filter((_, idx) => idx !== i))
    const abs = kept.length + i
    if (primaryIdx === abs) setPrimaryIdx(0)
    else if (primaryIdx > abs) setPrimaryIdx(p => p - 1)
  }

  return (
    <div className="space-y-3">
      {/* ── Hidden state for server action ── */}
      {kept.map((img, i) => (
        <span key={`kept-${i}`}>
          <input type="hidden" name={`existing_images[${i}][url]`}       value={img.url} />
          <input type="hidden" name={`existing_images[${i}][publicId]`}  value={img.cloudinaryPublicId ?? ''} />
          <input type="hidden" name={`existing_images[${i}][isPrimary]`} value={primaryIdx === i ? '1' : '0'} />
        </span>
      ))}
      {removed.map((pid, i) => (
        <input key={`rm-${i}`} type="hidden" name={`removed_publicIds[${i}]`} value={pid} />
      ))}
      {newFiles.map((nf, i) => (
        <span key={`nf-${i}`}>
          <input
            ref={el => { fileRefs.current[i] = el }}
            type="file"
            name="new_images"
            accept="image/*"
            className="hidden"
          />
          <input type="hidden" name={`new_images_primary[${i}]`} value={primaryIdx === kept.length + i ? '1' : '0'} />
        </span>
      ))}

      {/* ── Grid ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {/* Existing kept images */}
        {kept.map((img, i) => (
          <Thumb
            key={`e-${i}`}
            url={img.url}
            isPrimary={primaryIdx === i}
            onSelect={() => setPrimaryIdx(i)}
            onRemove={() => removeExisting(i)}
          />
        ))}

        {/* New file previews */}
        {newFiles.map((nf, i) => {
          const abs = kept.length + i
          return (
            <Thumb
              key={`n-${i}`}
              url={nf.previewUrl}
              isPrimary={primaryIdx === abs}
              onSelect={() => setPrimaryIdx(abs)}
              onRemove={() => removeNew(i)}
            />
          )
        })}

        {/* Add slot */}
        {canAdd && (
          <button
            type="button"
            onClick={() => triggerRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-navy hover:text-navy transition-colors"
          >
            <Upload size={18} />
            <span className="text-2.5 font-medium leading-none">Agregar</span>
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {totalCount}/{MAX} imágenes · Clic para marcar como principal
      </p>

      {/* Trigger input (hidden, multiple) */}
      <input
        ref={triggerRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAdd}
      />
    </div>
  )
}

function Thumb({ url, isPrimary, onSelect, onRemove }: {
  url: string
  isPrimary: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative group aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
        isPrimary ? 'border-navy shadow-sm' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="w-full h-full object-cover" />

      {isPrimary && (
        <div className="absolute bottom-0 inset-x-0 bg-navy text-white text-2.25 font-semibold text-center py-0.5 leading-tight">
          Principal
        </div>
      )}

      <button
        type="button"
        onClick={e => { e.stopPropagation(); onRemove() }}
        className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
      >
        <X size={10} />
      </button>
    </div>
  )
}
