"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

export function GoogleAnalytics({ id }: { id: string }) {
  const pathname = usePathname()
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
