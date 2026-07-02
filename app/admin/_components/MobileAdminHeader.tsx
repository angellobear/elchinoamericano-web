'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { SidebarNav } from './SidebarNav'

interface Props {
  isSuperAdmin: boolean
  email: string
  role: string
}

export function MobileAdminHeader({ isSuperAdmin, email, role }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <header className="md:hidden sticky top-0 z-30 h-14 flex items-center gap-3 px-4 bg-navy border-b border-white/10 shrink-0">
      <button
        onClick={() => setOpen(true)}
        className="text-white/70 hover:text-white transition-colors p-1"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      <Link href="/admin/dashboard" className="flex items-center gap-2 min-w-0">
        <div className="relative h-7 w-7 shrink-0">
          <Image src="/logo-ca.png" alt="El Chino Americano" fill className="object-contain" sizes="28px" />
        </div>
        <p className="text-sm font-semibold text-white truncate">
          El Chino <span className="text-brand">Americano</span>
        </p>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-64 p-0 bg-navy border-r border-white/10 text-white flex flex-col gap-0"
        >
          <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10 shrink-0">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 min-w-0"
              onClick={() => setOpen(false)}
            >
              <div className="relative h-9 w-9 shrink-0">
                <Image
                  src="/logo-ca.png"
                  alt="El Chino Americano"
                  fill
                  className="object-contain"
                  sizes="36px"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight text-white truncate">
                  El Chino <span className="text-brand">Americano</span>
                </p>
                <p className="text-white/35 text-xs">Panel de administración</p>
              </div>
            </Link>
          </div>
          <SidebarNav
            isSuperAdmin={isSuperAdmin}
            email={email}
            role={role}
            onLinkClick={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </header>
  )
}
