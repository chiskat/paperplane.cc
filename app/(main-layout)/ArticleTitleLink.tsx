'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'

import { Highlighter } from '@/components/ui/highlighter'
import { cn } from '@/utils/style'

export interface ArticleTitleLinkProps {
  href: string
  title: string
  dateText: string
  categories?: string[]
  tags?: string[]
  metaExtra?: ReactNode
  className?: string
  titleClassName?: string
}

export function ArticleTitleLink({
  href,
  title,
  dateText,
  categories = [],
  tags = [],
  metaExtra,
  className,
  titleClassName,
}: ArticleTitleLinkProps) {
  const [hovered, setHovered] = useState(false)
  const metaItems: ReactNode[] = [
    <span key="date">{dateText}</span>,
    categories.length > 0 ? (
      <span key="categories" className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {categories.map((category, index) => (
          <span key={category} className="flex items-center gap-x-1.5">
            {index > 0 && <span>/</span>}
            <Link
              href={`/categories/${encodeURIComponent(category)}`}
              className="hover:text-primary underline decoration-[#b7c0cc] underline-offset-3 transition-colors"
            >
              {category}
            </Link>
          </span>
        ))}
      </span>
    ) : null,
    tags.length > 0 ? (
      <span key="tags" className="flex flex-wrap items-center gap-1.5">
        {tags.map(tag => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="hover:bg-primary/10 hover:text-primary rounded-sm bg-[#f0f3f7] px-1.5 py-0.5 text-[#657386] transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </span>
    ) : null,
    metaExtra ? <span key="extra">{metaExtra}</span> : null,
  ].filter(Boolean)

  return (
    <li className={cn('relative rounded-sm px-2 py-1.5', className)}>
      <span className="pointer-events-none absolute top-3 -left-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-white bg-[#b7c0cc]" />
      <div className="font-en-sans mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[#7a8797]">
        {metaItems.map((item, index) => (
          <span key={index} className="inline-flex items-center gap-x-3">
            {index > 0 && <span className="h-0.75 w-0.75 rounded-full bg-[#b7c0cc]" />}
            {item}
          </span>
        ))}
      </div>
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'font-title-serif hover:text-primary inline-block py-0.5 text-[26px] leading-snug text-[#2f3a49] transition-colors',
          titleClassName
        )}
      >
        {hovered ? (
          <Highlighter action="underline" iterations={1} color="var(--primary)">
            {title}
          </Highlighter>
        ) : (
          title
        )}
      </Link>
    </li>
  )
}
