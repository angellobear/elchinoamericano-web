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
    <div className="mb-7">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-navy transition-colors duration-150 mb-4 uppercase tracking-wide"
      >
        <ArrowLeft size={13} />
        {backLabel}
      </Link>
      <h1 className="text-xl font-bold text-navy leading-tight">{title}</h1>
      {description ? (
        <p className="text-slate-400 text-sm mt-1">{description}</p>
      ) : null}
    </div>
  )
}
