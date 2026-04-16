'use client'

import { IconAppWindow, IconCalendarMonth, IconServer, IconStack2Filled } from '@tabler/icons-react'
import Link from 'next/link'

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

  return (
    <Link
      href={`/demos/${filename}`}
      className={cn(
        'group relative inline-flex max-w-full cursor-pointer self-start overflow-hidden rounded-sm border px-3 py-2 text-left transition-[box-shadow,background-color,border-color] duration-300',
        'border-transparent bg-transparent',
        'hover:border-slate-300/90 hover:bg-slate-100/85 hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.55)]',
        active && 'border-slate-300 bg-slate-100/95 shadow-[0_10px_26px_-18px_rgba(15,23,42,0.72)]',
        'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-y-1 left-1 z-10 w-1 origin-center rounded-sm bg-slate-400/80 transition-all duration-300',
          active
            ? 'scale-y-100 opacity-100'
            : 'scale-y-60 opacity-0 group-hover:scale-y-90 group-hover:opacity-70'
        )}
      />

      <div className="relative z-10 flex min-w-0 flex-col gap-0.5 pl-2">
        <p
          className={cn(
            'font-title-serif min-w-0 truncate text-[20px] transition-colors duration-300',
            active ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
          )}
        >
          {title}
        </p>

        <div
          className={cn(
            'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[14px] transition-colors duration-300',
            active ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-600'
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
