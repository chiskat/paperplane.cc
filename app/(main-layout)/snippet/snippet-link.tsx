'use client'

import { createElement } from 'react'

import { HighlighterLink } from '@/components/animate-ui/primitives/effects/highlighter-link'
import { getSnippetIconByKey } from '@/components/icon/snippet-icons'
import { cn } from '@/utils/style'

interface SnippetLinkOptionProps {
  title: string
  href: string
  active: boolean
  iconKey: string
}

export function SnippetLink({ title, href, active, iconKey }: SnippetLinkOptionProps) {
  const displayTitle = (
    <>
      {createElement(getSnippetIconByKey(iconKey), { className: 'mr-2 mb-0.5 shrink-0', size: 18 })}
      {title}
    </>
  )

  return (
    <div className="self-start">
      <HighlighterLink
        href={href}
        active={active}
        className={cn(
          'group focus-visible:ring-ring/50 inline-flex min-w-0 items-start gap-2 rounded-xl px-1 py-1 transition-[color] duration-200 focus-visible:ring-2 focus-visible:outline-none',
          active ? 'text-slate-950' : 'text-slate-800'
        )}
      >
        <span className="min-w-0 truncate text-[15px] leading-5">{displayTitle}</span>
      </HighlighterLink>
    </div>
  )
}
