'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Highlighter } from '@/components/ui/highlighter'

interface ArticleTitleLinkProps {
  href: string
  title: string
  className?: string
}

export function ArticleTitleLink({ href, title, className }: ArticleTitleLinkProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
    >
      {hovered ? (
        <Highlighter action="underline" iterations={1} color="#c0332f">
          {title}
        </Highlighter>
      ) : (
        title
      )}
    </Link>
  )
}
