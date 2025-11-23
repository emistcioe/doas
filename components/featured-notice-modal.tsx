"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

type Props = {
  open: boolean
  title: string
  imageUrl: string
  onClose: () => void
}

export function FeaturedNoticeModal({ open, title, imageUrl, onClose }: Props) {
  // Close on Esc
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Lock scroll when open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="absolute inset-0 grid place-items-center p-4"
        // stop overlay click from closing when clicking content
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute -top-3 -right-3 z-[75] rounded-full bg-black text-white p-2 shadow-md hover:bg-black/90 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="w-[min(100vw-2rem,1200px)] max-h-[90vh] h-auto object-contain rounded-md"
          />
        </div>
      </div>
    </div>
  )

  if (typeof document === "undefined") return null
  return createPortal(overlay, document.body)
}

export default FeaturedNoticeModal

