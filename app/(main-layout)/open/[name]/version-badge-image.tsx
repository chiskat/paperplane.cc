'use client'

import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/style'

export interface VersionBadgeImageProps {
  src: string
  alt: string
  className?: string
}

export function VersionBadgeImage({ src, alt, className }: VersionBadgeImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <span className="relative inline-flex min-h-5 min-w-24 items-center">
      {!loaded ? <Skeleton className="absolute inset-0 h-5 w-24 rounded-sm" /> : null}
      <img
        src={src}
        alt={alt}
        className={cn(
          'block h-5 transition-opacity duration-200',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </span>
  )
}
