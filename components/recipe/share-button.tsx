'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  title: string
}

export function ShareButton({ title }: ShareButtonProps) {
  async function share() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <button
      onClick={share}
      aria-label="Share recipe"
      className="flex items-center justify-center h-8 w-8 rounded-full bg-background/80 backdrop-blur border shadow-sm hover:bg-background transition-colors"
    >
      <Share2 className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}
