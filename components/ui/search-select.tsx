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

interface SearchSelectBaseProps {
  options: SearchSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

interface SearchSelectSingleProps extends SearchSelectBaseProps {
  multiple?: false
  value: string
  onChange: (value: string) => void
}

interface SearchSelectMultiProps extends SearchSelectBaseProps {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
}

export type SearchSelectProps = SearchSelectSingleProps | SearchSelectMultiProps

export function SearchSelect({
  options,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Sin resultados.',
  disabled = false,
  className,
  ...props
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false)

  const isMulti = props.multiple === true

  const selectedValues: string[] = isMulti
    ? (props as SearchSelectMultiProps).value
    : (props as SearchSelectSingleProps).value
      ? [(props as SearchSelectSingleProps).value]
      : []

  const selectedOptions = selectedValues
    .map(v => options.find(o => o.value === v))
    .filter(Boolean) as SearchSelectOption[]

  function toggle(val: string) {
    if (!isMulti) {
      const p = props as SearchSelectSingleProps
      p.onChange(p.value === val ? '' : val)
      setOpen(false)
      return
    }
    const p = props as SearchSelectMultiProps
    const next = p.value.includes(val)
      ? p.value.filter(v => v !== val)
      : [...p.value, val]
    p.onChange(next)
  }

  function clearAll(e: React.MouseEvent) {
    e.stopPropagation()
    if (isMulti) {
      ;(props as SearchSelectMultiProps).onChange([])
    } else {
      ;(props as SearchSelectSingleProps).onChange('')
    }
    setOpen(false)
  }

  function removeOne(e: React.MouseEvent, val: string) {
    e.stopPropagation()
    if (!isMulti) return
    const p = props as SearchSelectMultiProps
    p.onChange(p.value.filter(v => v !== val))
  }

  const hasValue = selectedValues.length > 0
  const MAX_PILLS = 2

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
            'flex min-h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-left transition-all',
            'hover:border-gray-300 hover:shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
            open && 'border-navy ring-2 ring-navy/20 shadow-sm',
            className,
          )}
        >
          {/* selected display */}
          <span className="flex flex-1 flex-wrap gap-1 min-w-0">
            {!hasValue && (
              <span className="text-gray-400 py-0.5 px-0.5">{placeholder}</span>
            )}
            {isMulti && selectedOptions.slice(0, MAX_PILLS).map(opt => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-0.5 rounded-md bg-navy/8 px-1.5 py-0.5 text-xs font-medium text-navy"
              >
                <span className="truncate max-w-24">{opt.label}</span>
                <span
                  role="button"
                  aria-label={`Quitar ${opt.label}`}
                  onClick={(e) => removeOne(e, opt.value)}
                  className="ml-0.5 rounded text-navy/50 hover:text-navy transition-colors"
                >
                  <X size={10} strokeWidth={2.5} />
                </span>
              </span>
            ))}
            {isMulti && selectedOptions.length > MAX_PILLS && (
              <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                +{selectedOptions.length - MAX_PILLS}
              </span>
            )}
            {!isMulti && hasValue && (
              <span className="py-0.5 px-0.5 text-gray-800 truncate">{selectedOptions[0]?.label}</span>
            )}
          </span>

          {/* right controls */}
          <span className="flex shrink-0 items-center gap-0.5 pl-1">
            {hasValue && !disabled && (
              <span
                role="button"
                aria-label="Limpiar selección"
                onClick={clearAll}
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
        className="w-[var(--radix-popover-trigger-width)] min-w-[180px] rounded-xl border border-gray-100 p-0 shadow-lg"
      >
        <Command>
          <div className="border-b border-gray-100 px-3 py-2 flex items-center gap-2">
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-7 border-0 p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-gray-400"
            />
          </div>
          <CommandList className="max-h-56 py-1">
            <CommandEmpty className="py-4 text-center text-xs text-gray-400">
              {emptyText}
            </CommandEmpty>
            <CommandGroup className="p-0">
              {options.map(opt => {
                const isSelected = selectedValues.includes(opt.value)
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => toggle(opt.value)}
                    className={cn(
                      'mx-1 my-0.5 flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-gray-700',
                      'data-[selected=true]:bg-navy/5 data-[selected=true]:text-navy',
                      isSelected && 'bg-navy/5 text-navy font-medium',
                    )}
                  >
                    <span className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                      isSelected
                        ? 'border-navy bg-navy text-white'
                        : 'border-gray-200 bg-white',
                    )}>
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </span>
                    {opt.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
