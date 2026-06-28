import type { Metadata } from "next"
import { Barlow_Condensed, Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/CartContext"
import {
  DEFAULT_KEYWORDS,
  DEFAULT_SHARE_IMAGE_ALT,
  DEFAULT_SHARE_IMAGE_HEIGHT,
  DEFAULT_SHARE_IMAGE_PATH,
  DEFAULT_SHARE_IMAGE_WIDTH,
  GEO_PLACENAME,
  GEO_POSITION,
  GEO_REGION,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  toAbsoluteUrl,
} from "@/lib/seo"

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | Repuestos Automotrices`,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: DEFAULT_KEYWORDS,
  referrer: "origin-when-cross-origin",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Automotive",
  classification: "Auto Parts Store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Repuestos Automotrices`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH),
        alt: DEFAULT_SHARE_IMAGE_ALT,
        width: DEFAULT_SHARE_IMAGE_WIDTH,
        height: DEFAULT_SHARE_IMAGE_HEIGHT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Repuestos Automotrices`,
    description: SITE_DESCRIPTION,
    images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": GEO_REGION,
    "geo.placename": GEO_PLACENAME,
    "geo.position": GEO_POSITION,
    ICBM: GEO_POSITION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <meta httpEquiv="content-language" content="es-EC" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
