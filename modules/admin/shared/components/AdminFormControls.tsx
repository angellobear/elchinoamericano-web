import type { ComponentProps, ReactNode } from 'react'

const baseControlClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy/25 focus:border-navy transition-colors duration-150'

interface FieldLabelProps {
  children: ReactNode
  required?: boolean
}

export function FieldLabel({ children, required = false }: FieldLabelProps) {
  return (
    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
      {children}
      {required ? <span className="text-brand normal-case tracking-normal ml-0.5"> *</span> : null}
    </label>
  )
}

export function TextInput(props: ComponentProps<'input'>) {
  return <input {...props} className={props.className ?? baseControlClass} />
}

export function TextArea(props: ComponentProps<'textarea'>) {
  return <textarea {...props} className={props.className ?? `${baseControlClass} resize-none`} />
}

export function SelectInput(props: ComponentProps<'select'>) {
  return <select {...props} className={props.className ?? baseControlClass} />
}

interface CheckboxFieldProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: string
}

export function CheckboxField({ label, ...props }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        {...props}
        type="checkbox"
        className="w-4 h-4 rounded border-slate-300 text-navy focus:ring-navy/30 focus:ring-2 cursor-pointer"
      />
      <span className="text-sm text-slate-700 select-none">{label}</span>
    </label>
  )
}

export function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      {children}
    </div>
  )
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">{children}</div>
}
