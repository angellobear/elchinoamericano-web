'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

export interface SearchSelectOption {
  value: string
  label: string
}

interface SearchSelectProps {
  value: string
  onChange: (value: string) => void
  options: SearchSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Sin resultados.',
  disabled = false,
  className,
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.find(o => o.value === value)

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-left transition-colors',
            'hover:border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
            open && 'border-navy ring-2 ring-navy/20',
            className,
          )}
        >
          <span className={cn('flex-1 truncate', !selected ? 'text-gray-400' : 'text-gray-800')}>
            {selected ? selected.label : placeholder}
          </span>
          <span className="flex shrink-0 items-center gap-0.5">
            {value && !disabled && (
              <span
                role="button"
                aria-label="Limpiar selección"
                onClick={handleClear}
                className="rounded p-0.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={12} strokeWidth={2.5} />
              </span>
            )}
            <ChevronsUpDown
              size={13}
              strokeWidth={2}
              className={cn('text-gray-300 transition-colors', open && 'text-navy')}
            />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] min-w-[160px] rounded-xl border border-gray-100 p-0 shadow-lg"
      >
        <Command>
          <div className="border-b border-gray-100 px-3 py-2 flex items-center gap-2">
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-7 border-0 p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-gray-400"
            />
          </div>
          <CommandList className="max-h-52 py-1">
            <CommandEmpty className="py-4 text-center text-xs text-gray-400">
              {emptyText}
            </CommandEmpty>
            <CommandGroup className="p-0">
              {options.map(opt => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => { onChange(opt.value); setOpen(false) }}
                  className="mx-1 my-0.5 flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-gray-700
                    data-[selected=true]:bg-navy/5 data-[selected=true]:text-navy"
                >
                  <Check
                    size={13}
                    strokeWidth={2.5}
                    className={cn('text-navy shrink-0', value === opt.value ? 'opacity-100' : 'opacity-0')}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
