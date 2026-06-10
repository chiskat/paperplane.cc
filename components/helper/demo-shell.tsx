'use client'

import {
  IconAlertTriangle,
  IconChevronDown,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react'
import { Component, useState, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/style'

export interface DemoShellProps {
  children: ReactNode
  title?: ReactNode
  manual?: boolean
  rerender?: boolean
  contentClassName?: string
  initButtonText?: ReactNode
  rerenderButtonText?: ReactNode
  className?: string
}

interface DemoErrorBoundaryProps {
  children: ReactNode
  onReload: () => void
}

interface DemoErrorBoundaryState {
  error: Error | null
  componentStack: string | null
}

class DemoErrorBoundary extends Component<DemoErrorBoundaryProps, DemoErrorBoundaryState> {
  state: DemoErrorBoundaryState = { componentStack: null, error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(_error: Error, errorInfo: ErrorInfo) {
    this.setState({ componentStack: errorInfo.componentStack || null })
  }

  render() {
    const { children } = this.props
    const { componentStack, error } = this.state

    if (!error) {
      return children
    }

    const errorStack = [
      error.stack || error.message,
      componentStack && `React 组件栈：\n${componentStack}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 px-5 py-8 text-center text-red-950 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100">
        <div className="flex size-12 items-center justify-center text-red-700 dark:text-red-200">
          <IconAlertTriangle aria-hidden stroke={2} />
        </div>

        <div className="font-title-serif space-y-2 text-[20px] font-semibold">
          Demo 渲染出错，点击右上角按钮以重载
        </div>

        <details className="group w-full max-w-3xl rounded-lg border border-red-200 bg-white/75 text-left dark:border-red-900/70 dark:bg-red-950/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-red-800 outline-none select-none hover:bg-red-100/60 dark:text-red-100 dark:hover:bg-red-900/30 [&::-webkit-details-marker]:hidden">
            <span>{error.message || '未知错误。'}</span>
            <IconChevronDown
              aria-hidden
              className="size-4 transition-transform group-open:rotate-180"
              stroke={2}
            />
          </summary>
          <pre className="max-h-80 overflow-auto border-t border-red-200 p-4 font-mono text-xs leading-5 whitespace-pre-wrap text-red-950 dark:border-red-900/70 dark:text-red-100">
            {errorStack || '没有可用的错误栈。'}
          </pre>
        </details>
      </div>
    )
  }
}

export function DemoShell({
  children,
  title,
  manual = false,
  rerender = false,
  contentClassName,
  initButtonText = '加载 Demo',
  rerenderButtonText = '重新渲染',
  className,
}: DemoShellProps) {
  const [renderKey, setRenderKey] = useState(0)
  const [initialized, setInitialized] = useState(!manual)

  const reloadChildren = () => {
    setInitialized(true)
    setRenderKey(key => key + 1)
  }

  const handleRerender = () => {
    if (!initialized) {
      setInitialized(true)
      return
    }

    reloadChildren()
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

        {rerender && initialized && (
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
        <DemoErrorBoundary key={renderKey} onReload={reloadChildren}>
          <div className={cn('font-sans text-[20px]', contentClassName)}>{children}</div>
        </DemoErrorBoundary>
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
