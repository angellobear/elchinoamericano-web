"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { ShoppingCart, MessageCircle, Menu, X } from "lucide-react"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/context/CartContext"
import CartDrawer from "@/components/CartDrawer"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#marcas", label: "Marcas" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
]

export default function Navbar() {
  const { itemCount } = useCart()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const prevItemCount = useRef(itemCount)
  const [badgeBounce, setBadgeBounce] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (itemCount > prevItemCount.current) {
      setBadgeBounce(true)
      const t = setTimeout(() => setBadgeBounce(false), 300)
      return () => clearTimeout(t)
    }
    prevItemCount.current = itemCount
  }, [itemCount])

  function isActive(href: string) {
    if (href.includes("#")) return false
    return href === "/" ? pathname === "/" : pathname.startsWith(href)
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 bg-navy transition-shadow duration-300",
          scrolled && "shadow-xl shadow-navy/40"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded-sm"
          >
            <Image
              src="/logo-ca.png"
              alt="El Chino Americano"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  isActive(link.href)
                    ? "text-brand bg-brand/10"
                    : "text-white/70 hover:text-white hover:bg-white/8"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* WhatsApp — desktop */}
            <a
              href="https://wa.me/593984878153"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-wa hover:brightness-105 text-[#062b15] text-sm font-bold px-4 py-2 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-11 h-11 text-white hover:text-brand hover:bg-white/8 rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={`Ver pedido${itemCount > 0 ? ` (${itemCount} productos)` : ""}`}
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span
                  className={cn(
                    "absolute top-1.5 right-1.5 bg-brand text-white text-[9px] font-bold rounded-full min-w-[16px] min-h-[16px] flex items-center justify-center px-1 leading-none",
                    badgeBounce && "animate-bounce-badge"
                  )}
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden flex items-center justify-center w-11 h-11 text-white hover:text-brand hover:bg-white/8 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-navy border-r border-white/10 w-64 px-6 pt-10">
                <div className="flex flex-col gap-8">
                  <a href="/">
                    <Image src="/logo-ca.png" alt="El Chino Americano" width={120} height={40} className="h-10 w-auto object-contain" />
                  </a>
                  <nav className="flex flex-col gap-1">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center px-3 py-3 rounded-md text-base font-semibold transition-colors duration-150 min-h-[44px]",
                          isActive(link.href)
                            ? "text-brand bg-brand/10"
                            : "text-white/80 hover:text-white hover:bg-white/8"
                        )}
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                  <a
                    href="https://wa.me/593984878153"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-wa text-[#062b15] text-sm font-bold px-4 py-3 rounded-xl transition-colors min-h-[44px]"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
