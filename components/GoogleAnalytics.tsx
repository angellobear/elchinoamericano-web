"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

export function GoogleAnalytics({ id }: { id: string }) {
  const pathname = usePathname()

  if (process.env.NODE_ENV !== "production") return null
  // /pedido lleva un token secreto en la URL: no debe llegar a terceros.
  if (pathname.startsWith("/admin") || pathname.startsWith("/pedido")) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  )
}
