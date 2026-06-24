"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

interface ProductStickyBarProps {
  ctaTargetId: string
  currentPrice: number
  originalPrice?: number
  whatsappHref: string
}

export default function ProductStickyBar({
  ctaTargetId,
  currentPrice,
  originalPrice,
  whatsappHref,
}: ProductStickyBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById(ctaTargetId)
    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0.35 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [ctaTargetId])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e6e9ef] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(13,31,60,.10)] backdrop-blur md:hidden"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0">
              {typeof originalPrice === "number" && (
                <div className="text-[11px] leading-none text-[#9aa3b2] line-through">
                  ${originalPrice.toFixed(2)}
                </div>
              )}
              <div className="font-display text-[1.625rem] font-bold leading-none text-navy">
                ${currentPrice.toFixed(2)}
              </div>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-wa px-4 py-3 text-[15px] font-bold text-[#062b15]"
            >
              <MessageCircle size={19} />
              Consultar
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
