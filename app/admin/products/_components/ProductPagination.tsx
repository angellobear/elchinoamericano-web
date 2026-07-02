'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  total: number
  limit: number
  baseParams: Record<string, string>
}

const PAGE_SIZES = [10, 20, 50, 100]

export function ProductPagination({ page, totalPages, total, limit, baseParams }: Props) {
  const router = useRouter()

  const nav = (newPage: number, newLimit = limit) => {
    const params = new URLSearchParams(baseParams)
    if (newPage > 1) params.set('page', String(newPage))
    else params.delete('page')
    if (newLimit !== 10) params.set('limit', String(newLimit))
    else params.delete('limit')
    const qs = params.toString()
    router.push(qs ? `/admin/products?${qs}` : '/admin/products')
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Ver</span>
        <select
          value={limit}
          onChange={(e) => nav(1, Number(e.target.value))}
          className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
        >
          {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span>por página &middot; <strong className="text-slate-700">{total}</strong> total</span>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => nav(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="px-3 text-sm text-slate-600 tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => nav(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
