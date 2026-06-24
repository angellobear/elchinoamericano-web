import type { ComponentProps, ReactNode } from 'react'

const baseControlClass =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent'

interface FieldLabelProps {
  children: ReactNode
  required?: boolean
}

export function FieldLabel({ children, required = false }: FieldLabelProps) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required ? <span className="text-brand"> *</span> : null}
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
  return <select {...props} className={props.className ?? `${baseControlClass} bg-white`} />
}

interface CheckboxFieldProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: string
}

export function CheckboxField({ label, ...props }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-3">
      <input
        {...props}
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )
}

export function FormCard({ children }: { children: ReactNode }) {
  return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">{children}</div>
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex gap-3 pt-2">{children}</div>
}
