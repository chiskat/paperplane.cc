'use client'

import { IconAppWindow, IconCalendarMonth, IconServer, IconStack2Filled } from '@tabler/icons-react'
import Link from 'next/link'
import { useLayoutEffect, useRef, useState } from 'react'
import { annotate } from 'rough-notation'

import { Highlighter } from '@/components/ui/highlighter'
import { cn } from '@/utils/style'

const demoTypeMap = {
  frontend: { label: '前端', Icon: IconAppWindow },
  backend: { label: '后端', Icon: IconServer },
  fullstack: { label: '全栈', Icon: IconStack2Filled },
} as const

export interface DemoSidebarItemProps {
  active: boolean
  title: string
  filename: string
  type: keyof typeof demoTypeMap
  status: string
}

export function DemoSidebarItem({ title, active, filename, type, status }: DemoSidebarItemProps) {
  const { label, Icon } = demoTypeMap[type]
  const itemRef = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)

  useLayoutEffect(() => {
    const element = itemRef.current
    if (!element || !active) {
      return
    }

    const annotation = annotate(element, {
      type: 'highlight',
      color: '#97d7ff',
      animationDuration: 550,
      iterations: 2,
      multiline: true,
      padding: 3,
    })

    annotation.show()

    return () => {
      annotation.remove()
    }
  }, [active])

  return (
    <Link
      ref={itemRef}
      href={`/demos/${filename}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative inline-flex max-w-full cursor-pointer self-start overflow-hidden rounded-sm border px-3 py-2 text-left transition-colors duration-300',
        'border-transparent bg-transparent',
        'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <div className="relative z-10 flex min-w-0 flex-col gap-0.5 pl-2">
        {hovered ? (
          <Highlighter action="underline" color="#97d7ff" iterations={1} padding={0}>
            <p
              className={cn(
                'font-title-serif min-w-0 truncate text-[20px] text-slate-700 transition-colors duration-300'
              )}
            >
              {title}
            </p>
          </Highlighter>
        ) : (
          <p
            className={cn(
              'font-title-serif min-w-0 truncate text-[20px] text-slate-700 transition-colors duration-300'
            )}
          >
            {title}
          </p>
        )}

        <div
          className={cn(
            'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-slate-500 transition-colors duration-300'
          )}
        >
          <span className="inline-flex items-center gap-1">
            <Icon size={16} stroke={1.8} />
            <span>{label}</span>
          </span>

          <span className="inline-flex min-w-0 items-center gap-1">
            <IconCalendarMonth size={16} stroke={1.8} />
            <span className="min-w-0 truncate">{status}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
