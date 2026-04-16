'use client'

import Link from 'next/link'
import { createElement, useState } from 'react'

import { getSnippetIconByKey } from '@/components/icon/snippet-icons'
import { Highlighter } from '@/components/ui/highlighter'
import { cn } from '@/utils/style'

interface SnippetLinkOptionProps {
  title: string
  href: string
  active: boolean
  iconKey: string
}

export function SnippetLink({ title, href, active, iconKey }: SnippetLinkOptionProps) {
  const [hovered, setHovered] = useState(false)

  const displayTitle = (
    <>
      {createElement(getSnippetIconByKey(iconKey), { className: 'mr-2 shrink-0', size: 18 })}
      {title}
    </>
  )

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group focus-visible:ring-ring/50 flex min-w-0 items-start gap-2 rounded-xl px-1 py-1 transition-[color] duration-200 focus-visible:ring-2 focus-visible:outline-none',
        active ? 'text-slate-950' : 'text-slate-800'
      )}
    >
      <span className="min-w-0 truncate text-[15px] leading-5">
        {active ? (
          <Highlighter action="highlight" color="#97d7ff">
            {displayTitle}
          </Highlighter>
        ) : hovered ? (
          <Highlighter action="underline" color="#97d7ff" iterations={1} padding={0}>
            {displayTitle}
          </Highlighter>
        ) : (
          displayTitle
        )}
      </span>
    </Link>
  )
}
