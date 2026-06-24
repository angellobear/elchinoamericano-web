import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  backHref: string
  backLabel: string
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  backLabel,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-3"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </Link>
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      {description ? <p className="text-gray-500 text-sm mt-0.5">{description}</p> : null}
    </div>
  )
}
