'use client'

import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ComponentRef,
} from 'react'

import { ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/utils/style'

const SCROLL_EPSILON = 1

export interface ScrollAreaFadeProps extends ComponentProps<typeof ScrollAreaPrimitive.Root> {
  fadeSize?: number
  topFadeClassName?: string
  bottomFadeClassName?: string
}

function ScrollAreaFade({
  className,
  children,
  fadeSize = 24,
  topFadeClassName,
  bottomFadeClassName,
  ...props
}: ScrollAreaFadeProps) {
  const rootRef = useRef<ComponentRef<typeof ScrollAreaPrimitive.Root> | null>(null)

  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)

  const getViewport = useCallback(() => {
    return rootRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]') ?? null
  }, [])

  const updateFade = useCallback(() => {
    const viewport = getViewport()

    if (!viewport) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = viewport
    const maxScrollTop = scrollHeight - clientHeight
    const canScroll = maxScrollTop > SCROLL_EPSILON

    if (!canScroll) {
      setShowTopFade(false)
      setShowBottomFade(false)
      return
    }

    setShowTopFade(scrollTop > SCROLL_EPSILON)
    setShowBottomFade(maxScrollTop - scrollTop > SCROLL_EPSILON)
  }, [getViewport])

  useEffect(() => {
    const viewport = getViewport()

    if (!viewport) {
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateFade()

    const onScroll = () => {
      updateFade()
    }

    viewport.addEventListener('scroll', onScroll, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      updateFade()
    })

    resizeObserver.observe(viewport)

    if (viewport.firstElementChild) {
      resizeObserver.observe(viewport.firstElementChild)
    }

    window.addEventListener('resize', updateFade)

    return () => {
      viewport.removeEventListener('scroll', onScroll)
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateFade)
    }
  }, [children, getViewport, updateFade])

  return (
    <ScrollAreaPrimitive.Root
      ref={rootRef}
      data-slot="scroll-area"
      className={cn('relative', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      <div
        aria-hidden="true"
        className={cn(
          'from-background pointer-events-none absolute inset-x-0 top-0 z-10 bg-linear-to-b to-transparent transition-opacity duration-200',
          showTopFade ? 'opacity-100' : 'opacity-0',
          topFadeClassName
        )}
        style={{ height: fadeSize }}
      />

      <div
        aria-hidden="true"
        className={cn(
          'from-background pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t to-transparent transition-opacity duration-200',
          showBottomFade ? 'opacity-100' : 'opacity-0',
          bottomFadeClassName
        )}
        style={{ height: fadeSize }}
      />

      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

export { ScrollAreaFade }
