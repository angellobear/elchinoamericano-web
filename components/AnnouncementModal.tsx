"use client"

import { useEffect, useRef, useState } from "react"
import Image from "@/components/CloudImage"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

interface Announcement {
  id: number
  title: string | null
  description: string | null
  imageUrl: string
  linkUrl: string | null
}

// Una vez al día por navegador. Guarda el id: si publican otro anuncio, se muestra igual.
const COOKIE = "anuncio_visto"
const ONE_DAY = 60 * 60 * 24

function readSeenId() {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.split("=")[1]
}

export function AnnouncementModal() {
  const pathname = usePathname()
  const asked = useRef(false)
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (asked.current) return
    if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/pedido")) return
    asked.current = true

    let cancelled = false
    fetch("/api/announcement")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Announcement | null) => {
        if (cancelled || !data || String(data.id) === readSeenId()) return
        setAnnouncement(data)
        setOpen(true)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [pathname])

  function dismiss() {
    setOpen(false)
    if (announcement) {
      document.cookie = `${COOKIE}=${announcement.id}; path=/; max-age=${ONE_DAY}; samesite=lax`
    }
  }

  if (!announcement) return null

  const alt = announcement.title ?? "Anuncio de El Chino Americano"
  const hasPanel = Boolean(announcement.title || announcement.description || announcement.linkUrl)
  // ponytail: la imagen manda el ancho del modal (w-auto + tope de alto), así no quedan franjas.
  // Alto: 80dvh en móvil, 70dvh desde sm. Con panel de texto se reservan 10rem; el panel hace scroll si se pasa.
  const image = (
    <Image
      src={announcement.imageUrl}
      alt={alt}
      width={800}
      height={800}
      className={`block h-auto w-auto max-w-[min(calc(100vw-2rem),32rem)] ${hasPanel ? "max-h-[calc(80dvh-10rem)] sm:max-h-[calc(70dvh-10rem)]" : "max-h-[80dvh] sm:max-h-[70dvh]"}`}
      priority={false}
    />
  )

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/65"
        className="w-fit max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl sm:max-w-lg"
      >
        <DialogClose
          className="absolute right-3 top-3 z-10 rounded-full border border-white/80 bg-black/30 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/70"
          aria-label="Cerrar anuncio"
        >
          <X size={16} strokeWidth={1.5} />
        </DialogClose>

        {announcement.linkUrl ? (
          <Link href={announcement.linkUrl} onClick={dismiss} tabIndex={-1}>
            {image}
          </Link>
        ) : (
          image
        )}

        {/* w-0 min-w-full: el texto toma el ancho de la imagen en vez de ensanchar el modal */}
        <div className={hasPanel ? "w-0 min-w-full max-h-40 overflow-y-auto px-5 py-4" : "sr-only"}>
          <DialogTitle className={announcement.title ? "font-display text-xl font-bold text-navy" : "sr-only"}>
            {announcement.title ?? alt}
          </DialogTitle>
          <DialogDescription
            className={announcement.description ? "mt-1 text-sm text-slate-600" : "sr-only"}
          >
            {announcement.description ?? "Aviso de El Chino Americano"}
          </DialogDescription>
          {announcement.linkUrl ? (
            <Link
              href={announcement.linkUrl}
              onClick={dismiss}
              className="mt-3 block rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand/90"
            >
              Ver más
            </Link>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
