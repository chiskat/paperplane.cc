'use client'

import { HighlighterLink } from '@/components/animate-ui/primitives/effects/highlighter-link'
import { PackageIcon } from '@/components/icon/package-icon'
import { cn } from '@/utils/style'

export type OpenProjectType = 'npm' | 'docker'

export interface OpenSidebarItemProps {
  active: boolean
  name: string
  repo: string
  type: OpenProjectType
  filename: string
}

export function OpenSidebarItem({ name, type, active, filename }: OpenSidebarItemProps) {
  const displayName = (
    <>
      <PackageIcon type={type} className="mr-2 select-none" />
      {name}
    </>
  )

  return (
    <HighlighterLink
      href={`/open/${filename}`}
      active={active}
      className={cn(
        'font-title-serif group relative inline-flex max-w-full cursor-pointer self-start rounded-2xl px-1 py-1 text-left text-[20px] transition-all duration-200',
        'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none'
      )}
    >
      <span
        className={cn(
          'flex min-w-0 items-center gap-2 truncate',
          active ? 'text-slate-900' : 'text-slate-700'
        )}
      >
        {displayName}
      </span>
    </HighlighterLink>
  )
}
