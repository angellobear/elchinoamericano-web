'use client'

import { useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface AdminSearchInputProps {
  defaultValue?: string
  placeholder?: string
  name?: string
}

export function AdminSearchInput({
  defaultValue = '',
  placeholder = 'Buscar...',
  name = 'search',
}: AdminSearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasValue, setHasValue] = useState(!!defaultValue)

  const navigate = (value: string) => {
    const params = new URLSearchParams()
    if (value) params.set(name, value)
    router.push(value ? `${pathname}?${params}` : pathname)
  }

  const submit = () => navigate(inputRef.current?.value ?? '')

  const clear = () => {
    if (inputRef.current) inputRef.current.value = ''
    setHasValue(false)
    navigate('')
  }

  return (
    <div className="mb-5 flex gap-2">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={(e) => setHasValue(!!e.target.value)}
          className="w-full border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => { if (inputRef.current) inputRef.current.value = ''; setHasValue(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={submit}
        className="px-4 py-2.5 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all"
      >
        Buscar
      </button>
      {hasValue && (
        <button
          type="button"
          onClick={clear}
          className="px-4 py-2.5 bg-brand/10 text-brand text-sm font-medium rounded-lg hover:bg-brand/20 active:scale-[0.98] transition-all whitespace-nowrap"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
