'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function ToastOnMount() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const success = params.get('success')
    const error   = params.get('error')

    if (success) {
      toast.success(decodeURIComponent(success))
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      router.replace(url.pathname + (url.search || ''), { scroll: false })
    }
    if (error) {
      toast.error(decodeURIComponent(error))
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      router.replace(url.pathname + (url.search || ''), { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
