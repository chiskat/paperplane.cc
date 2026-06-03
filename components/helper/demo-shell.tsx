'use client'

import { IconPlayerPlay, IconRefresh } from '@tabler/icons-react'
import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/style'

export interface DemoShellProps {
  children: ReactNode
  title?: ReactNode
  manual?: boolean
  contentClassName?: string
  initButtonText?: ReactNode
  rerenderButtonText?: ReactNode
  className?: string
}

export function DemoShell({
  children,
  title,
  manual = false,
  contentClassName,
  initButtonText = '加载 Demo',
  rerenderButtonText = '重新渲染',
  className,
}: DemoShellProps) {
  const [renderKey, setRenderKey] = useState(0)
  const [initialized, setInitialized] = useState(!manual)

  const handleRerender = () => {
    if (!initialized) {
      setInitialized(true)
      return
    }

    setRenderKey(key => key + 1)
  }

  return (
    <section
      className={cn(
        'not-prose rounded-xl border border-zinc-300 bg-white p-5 font-sans text-[20px] text-zinc-900 shadow-sm ring-1 ring-zinc-950/5',
        'dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100 dark:ring-white/10',
        className
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-4 border-b-2 border-dashed border-zinc-300 pb-4 dark:border-zinc-700">
        <div className="font-title-serif min-w-0 truncate text-[20px] font-semibold text-zinc-900 dark:text-zinc-100">
          <span>在线 Demo</span>
          {title && (
            <>
              <span className="mx-2 text-zinc-400 dark:text-zinc-500">·</span>
              {title}
            </>
          )}
        </div>

        {initialized && (
          <Button
            aria-label="重新渲染 Demo"
            className="ml-auto border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-800 dark:border-sky-800/70 dark:bg-sky-950/40 dark:text-sky-200 dark:hover:border-sky-700 dark:hover:bg-sky-900/50 dark:hover:text-sky-100"
            size="sm"
            variant="outline"
            onClick={handleRerender}
          >
            <IconRefresh stroke={2} />
            {rerenderButtonText}
            <span className="font-mono text-[0.9em] text-sky-600 tabular-nums dark:text-sky-300">
              #{renderKey}
            </span>
          </Button>
        )}
      </div>

      {initialized ? (
        <div key={renderKey} className={cn('font-sans text-[20px]', contentClassName)}>
          {children}
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center">
          <Button aria-label="加载 Demo" size="lg" onClick={handleRerender}>
            <IconPlayerPlay />
            {initButtonText}
          </Button>
        </div>
      )}
    </section>
  )
}
