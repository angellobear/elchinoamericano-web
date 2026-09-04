"use client"

import Script from "next/script"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackWhatsApp } from "@/lib/analytics"

export function GoogleAnalytics({ id }: { id: string }) {
  const pathname = usePathname()

  // ponytail: un listener delegado cubre todos los <a> a wa.me, incluidos los
  // que viven en Server Components. Cada boton solo declara data-wa="...".
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      const link = el?.closest?.('a[href*="wa.me/"]') as HTMLAnchorElement | null
      if (!link) return
      trackWhatsApp(link.dataset.wa ?? "sin_etiqueta", link.dataset.waItem)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  if (process.env.NODE_ENV !== "production") return null
  if (pathname.startsWith("/admin")) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  )
}
