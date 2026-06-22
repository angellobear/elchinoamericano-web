"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { ShoppingCart, MessageCircle, Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/context/CartContext"
import CartDrawer from "@/components/CartDrawer"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
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

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 bg-navy transition-shadow duration-200",
          scrolled && "shadow-lg shadow-navy/30"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-brand flex items-center justify-center rounded-sm">
              <span className="font-display font-bold text-white text-base leading-none tracking-tight">
                CA
              </span>
            </div>
            <div className="leading-none">
              <div className="font-display font-bold text-white text-sm tracking-wide uppercase">
                El Chino
              </div>
              <div className="font-display font-bold text-brand text-sm tracking-wide uppercase">
                Americano
              </div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-150",
                  pathname === link.href
                    ? "text-brand"
                    : "text-white/75 hover:text-brand"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/593984878153"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-wa hover:bg-wa/90 text-white text-sm font-semibold px-3 py-1.5 rounded-md transition-colors duration-150"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>

            <button
              onClick={() => setCartOpen(true)}
              className="relative text-white hover:text-brand transition-colors duration-150 p-1"
              aria-label="Ver pedido"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-1.5 -right-1.5 bg-brand text-white text-[9px] font-bold rounded-full min-w-[17px] min-h-[17px] flex items-center justify-center px-1",
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
                  className="md:hidden text-white hover:text-brand transition-colors p-1"
                  aria-label="Menu"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-navy border-navy-dark w-64 px-6 pt-10">
                <div className="flex flex-col gap-8">
                  <a href="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand flex items-center justify-center rounded-sm shrink-0">
                      <span className="font-display font-bold text-white text-base">CA</span>
                    </div>
                    <div className="leading-none">
                      <div className="font-display font-bold text-white text-sm tracking-wide uppercase">El Chino</div>
                      <div className="font-display font-bold text-brand text-sm tracking-wide uppercase">Americano</div>
                    </div>
                  </a>
                  <nav className="flex flex-col gap-5">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "text-base font-semibold transition-colors duration-150",
                          pathname === link.href ? "text-brand" : "text-white/80 hover:text-brand"
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
                    className="inline-flex items-center gap-2 bg-wa hover:bg-wa/90 text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors w-fit"
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
