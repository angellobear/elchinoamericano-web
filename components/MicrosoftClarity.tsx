"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

export function MicrosoftClarity({ id }: { id: string }) {
  const pathname = usePathname()
  if (process.env.NODE_ENV !== "production") return null
  // /pedido lleva un token secreto en la URL y datos del cliente: sin grabación de sesión.
  if (pathname.startsWith("/admin") || pathname.startsWith("/pedido")) return null

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`}
    </Script>
  )
}
