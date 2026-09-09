"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
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
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return
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
  const image = (
    <Image
      src={announcement.imageUrl}
      alt={alt}
      width={800}
      height={800}
      className="w-full h-auto"
      priority={false}
    />
  )

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 overflow-hidden rounded-2xl border-0 sm:max-w-lg"
      >
        <DialogClose
          className="absolute right-3 top-3 z-10 rounded-full bg-black/55 p-1.5 text-white transition-colors hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white/70"
          aria-label="Cerrar anuncio"
        >
          <X size={16} />
        </DialogClose>

        {announcement.linkUrl ? (
          <Link href={announcement.linkUrl} onClick={dismiss}>
            {image}
          </Link>
        ) : (
          image
        )}

        {announcement.title ? (
          <DialogTitle className="px-5 pt-4 font-display text-xl font-bold text-navy">
            {announcement.title}
          </DialogTitle>
        ) : (
          <DialogTitle className="sr-only">{alt}</DialogTitle>
        )}

        {announcement.description ? (
          <DialogDescription className="px-5 pt-2 text-sm text-slate-600">
            {announcement.description}
          </DialogDescription>
        ) : (
          <DialogDescription className="sr-only">
            Aviso de El Chino Americano
          </DialogDescription>
        )}

        <div className="flex gap-3 p-5">
          {announcement.linkUrl ? (
            <Link
              href={announcement.linkUrl}
              onClick={dismiss}
              className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand/90"
            >
              Ver más
            </Link>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
