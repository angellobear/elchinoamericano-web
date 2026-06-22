import type { Metadata } from "next"
import { Barlow_Condensed, Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/CartContext"

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
  title: "El Chino Americano — Repuestos Automotrices",
  description:
    "Tienda online de repuestos para vehiculos chinos y americanos. Catalogo con filtros y pedido por WhatsApp. Entrega en Quito y envios a todo el Ecuador.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
