'use client'

import Link from 'next/link'
import { useState } from 'react'

import { PackageIcon } from '@/components/icon/package-icon'
import { Highlighter } from '@/components/ui/highlighter'
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
  const [hovered, setHovered] = useState(false)

  const displayName = (
    <>
      <PackageIcon type={type} className="mr-2 select-none" />
      {name}
    </>
  )

  return (
    <Link
      href={`/open/${filename}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative inline-flex max-w-full cursor-pointer self-start rounded-2xl px-1 py-1 text-left transition-all duration-200',
        'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <div className="flex min-w-0 items-center gap-2">
        <p
          className={cn(
            'font-title-serif min-w-0 truncate text-[20px]',
            active ? 'text-slate-900' : 'text-slate-700'
          )}
        >
          {active ? (
            <Highlighter action="highlight" color="#97d7ff">
              {displayName}
            </Highlighter>
          ) : hovered ? (
            <Highlighter action="underline" color="#97d7ff" iterations={1} padding={0}>
              {displayName}
            </Highlighter>
          ) : (
            displayName
          )}
        </p>
      </div>
    </Link>
  )
}
