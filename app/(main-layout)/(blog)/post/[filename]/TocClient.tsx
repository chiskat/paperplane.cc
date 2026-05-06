'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/utils/style'
import type { TocItem } from './Toc'

const ACTIVE_HEADING_OFFSET = 180
const DEFAULT_SCROLL_TARGET_OFFSET = 128
const INDICATOR_TRANSITION = { type: 'spring', stiffness: 420, damping: 38, mass: 0.6 } as const
const INDICATOR_SCROLLING_TRANSITION = { duration: 0.2, ease: 'easeOut' } as const
const INDICATOR_VISIBILITY_TRANSITION = { duration: 0.16, ease: 'easeOut' } as const
const INDICATOR_SETTLE_MS = 180
const AUTO_SCROLL_MIN_DURATION_MS = 180
const AUTO_SCROLL_MAX_DURATION_MS = 420
const AUTO_SCROLL_PX_PER_MS = 3.2

interface IndicatorRect {
  top: number
  left: number
  width: number
  height: number
}

function getScrollTargetOffset() {
  const fixedHeader = document.querySelector<HTMLElement>('header.fixed')
  if (!fixedHeader) {
    return DEFAULT_SCROLL_TARGET_OFFSET
  }

  return Math.max(
    DEFAULT_SCROLL_TARGET_OFFSET,
    Math.round(fixedHeader.getBoundingClientRect().height + 12)
  )
}

function getActiveHeadingId(tocItems: TocItem[]): string | null {
  const firstExistingHeading = tocItems.find(item => document.getElementById(item.id))
  const firstHeadingElement = firstExistingHeading
    ? document.getElementById(firstExistingHeading.id)
    : null
  const articleElement = firstHeadingElement?.closest('article')

  if (articleElement) {
    const articleRect = articleElement.getBoundingClientRect()
    const isArticleOutsideViewport =
      articleRect.bottom <= 0 || articleRect.top >= window.innerHeight

    if (isArticleOutsideViewport) {
      return null
    }
  }

  let currentId: string | null = null

  for (const item of tocItems) {
    const heading = document.getElementById(item.id)
    if (!heading) {
      continue
    }

    if (heading.getBoundingClientRect().top <= ACTIVE_HEADING_OFFSET) {
      currentId = item.id
      continue
    }

    break
  }

  if (currentId) {
    return currentId
  }

  return firstExistingHeading?.id ?? null
}

export interface TocClientProps {
  title: string
  tocItems: TocItem[]
}

export default function TocClient({ title, tocItems }: TocClientProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isIndicatorSoftTransition, setIsIndicatorSoftTransition] = useState(false)
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect | null>(null)
  const tocIdSet = useMemo(() => new Set(tocItems.map(item => item.id)), [tocItems])
  const listRef = useRef<HTMLOListElement>(null)
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
  const autoScrollTargetIdRef = useRef<string | null>(null)
  const autoScrollRafRef = useRef<number | null>(null)
  const indicatorSettleTimeoutRef = useRef<number | null>(null)

  const clearIndicatorSettleTimeout = useCallback(() => {
    if (indicatorSettleTimeoutRef.current) {
      window.clearTimeout(indicatorSettleTimeoutRef.current)
      indicatorSettleTimeoutRef.current = null
    }
  }, [])

  const clearAutoScrollState = useCallback(() => {
    autoScrollTargetIdRef.current = null

    if (autoScrollRafRef.current) {
      window.cancelAnimationFrame(autoScrollRafRef.current)
      autoScrollRafRef.current = null
    }
  }, [])

  const syncActiveIdWithViewport = useCallback(() => {
    const nextId = getActiveHeadingId(tocItems)
    setActiveId(prev => (prev === nextId ? prev : nextId))
  }, [tocItems])

  const finishAutoScroll = useCallback(() => {
    const finishedTargetId = autoScrollTargetIdRef.current
    clearAutoScrollState()
    if (finishedTargetId) {
      setActiveId(prev => (prev === finishedTargetId ? prev : finishedTargetId))
    }

    clearIndicatorSettleTimeout()
    indicatorSettleTimeoutRef.current = window.setTimeout(() => {
      setIsIndicatorSoftTransition(false)
      indicatorSettleTimeoutRef.current = null
    }, INDICATOR_SETTLE_MS)
  }, [clearAutoScrollState, clearIndicatorSettleTimeout])

  const cancelAutoScrollByUser = useCallback(() => {
    if (!autoScrollTargetIdRef.current) {
      return
    }

    clearAutoScrollState()
    clearIndicatorSettleTimeout()
    setIsIndicatorSoftTransition(false)
    syncActiveIdWithViewport()
  }, [clearAutoScrollState, clearIndicatorSettleTimeout, syncActiveIdWithViewport])

  const handleTocTitleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      cancelAutoScrollByUser()

      if (window.location.hash) {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}`
        )
      }

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    },
    [cancelAutoScrollByUser]
  )

  const handleTocClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault()

      const heading = document.getElementById(id)
      if (!heading) {
        return
      }

      clearAutoScrollState()

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const maxScrollTop = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      const targetOffset = getScrollTargetOffset()
      const rawTargetTop = heading.getBoundingClientRect().top + window.scrollY - targetOffset
      const targetTop = Math.min(Math.max(rawTargetTop, 0), maxScrollTop)
      const targetHash = `#${encodeURIComponent(id)}`

      autoScrollTargetIdRef.current = id
      setActiveId(prev => (prev === id ? prev : id))
      clearIndicatorSettleTimeout()
      setIsIndicatorSoftTransition(true)

      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash)
      }

      if (prefersReducedMotion) {
        window.scrollTo({ top: targetTop, behavior: 'auto' })
        finishAutoScroll()
        return
      }

      const startTop = window.scrollY
      const distance = Math.abs(targetTop - startTop)
      const duration = Math.min(
        AUTO_SCROLL_MAX_DURATION_MS,
        Math.max(AUTO_SCROLL_MIN_DURATION_MS, distance / AUTO_SCROLL_PX_PER_MS)
      )
      const startedAt = window.performance.now()

      const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

      const animateScroll = (timestamp: number) => {
        if (autoScrollTargetIdRef.current !== id) {
          return
        }

        const progress = Math.min((timestamp - startedAt) / duration, 1)
        const nextTop = startTop + (targetTop - startTop) * easeOutCubic(progress)
        window.scrollTo({ top: nextTop, behavior: 'auto' })

        if (progress >= 1) {
          finishAutoScroll()
          return
        }

        autoScrollRafRef.current = window.requestAnimationFrame(animateScroll)
      }

      autoScrollRafRef.current = window.requestAnimationFrame(animateScroll)
    },
    [clearAutoScrollState, clearIndicatorSettleTimeout, finishAutoScroll]
  )

  const updateIndicatorRect = useCallback(() => {
    if (!activeId) {
      setIndicatorRect(null)
      return
    }

    const list = listRef.current
    const activeLink = linkRefs.current.get(activeId)
    if (!list || !activeLink) {
      setIndicatorRect(null)
      return
    }

    const listRect = list.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    const nextRect: IndicatorRect = {
      top: linkRect.top - listRect.top + list.scrollTop,
      left: linkRect.left - listRect.left + list.scrollLeft,
      width: linkRect.width,
      height: linkRect.height,
    }

    setIndicatorRect(prev => {
      if (
        prev &&
        prev.top === nextRect.top &&
        prev.left === nextRect.left &&
        prev.width === nextRect.width &&
        prev.height === nextRect.height
      ) {
        return prev
      }
      return nextRect
    })
  }, [activeId])

  useEffect(() => {
    if (!tocItems.length) {
      return
    }

    let rafId = 0

    const updateActiveId = () => {
      const lockedTargetId = autoScrollTargetIdRef.current
      if (lockedTargetId) {
        setActiveId(prev => (prev === lockedTargetId ? prev : lockedTargetId))
        return
      }

      const nextId = getActiveHeadingId(tocItems)
      setActiveId(prev => (prev === nextId ? prev : nextId))
    }

    const onScrollLikeEvent = () => {
      if (rafId) {
        return
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        updateActiveId()
      })
    }

    const onHashChange = () => {
      const hashId = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (hashId && tocIdSet.has(hashId)) {
        clearAutoScrollState()
        clearIndicatorSettleTimeout()
        setIsIndicatorSoftTransition(false)
        setActiveId(hashId)
        return
      }

      onScrollLikeEvent()
    }

    updateActiveId()
    window.addEventListener('scroll', onScrollLikeEvent, { passive: true })
    window.addEventListener('resize', onScrollLikeEvent)
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('wheel', cancelAutoScrollByUser, { passive: true })
    window.addEventListener('touchmove', cancelAutoScrollByUser, { passive: true })

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }

      window.removeEventListener('scroll', onScrollLikeEvent)
      window.removeEventListener('resize', onScrollLikeEvent)
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('wheel', cancelAutoScrollByUser)
      window.removeEventListener('touchmove', cancelAutoScrollByUser)
    }
  }, [
    cancelAutoScrollByUser,
    clearAutoScrollState,
    clearIndicatorSettleTimeout,
    tocItems,
    tocIdSet,
  ])

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      updateIndicatorRect()
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [updateIndicatorRect, tocItems])

  useEffect(() => {
    const onResize = () => {
      updateIndicatorRect()
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [updateIndicatorRect])

  useEffect(() => {
    return () => {
      if (autoScrollRafRef.current) {
        window.cancelAnimationFrame(autoScrollRafRef.current)
      }

      clearIndicatorSettleTimeout()
    }
  }, [clearIndicatorSettleTimeout])

  return (
    <aside className="mb-6 lg:absolute lg:inset-y-0 lg:right-0 lg:mb-0 lg:w-68">
      <div className="relative overflow-hidden rounded-sm border border-[#d6dce5] px-4 py-3 shadow-[0px_0px_3px_1px_#eee] backdrop-blur-xs before:pointer-events-none before:absolute before:top-0 before:right-0 before:left-0 before:h-8 before:bg-linear-to-b before:from-white/60 before:to-transparent lg:sticky lg:top-36 lg:flex lg:max-h-[calc(100vh-10rem)] lg:flex-col">
        <h2 className="font-title-serif relative mb-4 pb-3 text-base text-[18px] text-[#4a5665] after:absolute after:-right-4 after:bottom-0 after:-left-4 after:border-b after:border-dashed after:border-[#2f629d]/40">
          <a href="#article-top" onClick={handleTocTitleClick}>
            {title}
          </a>
        </h2>

        <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:rounded-xs [&::-webkit-scrollbar]:bg-[#eee] [&::-webkit-scrollbar-thumb]:rounded-xs [&::-webkit-scrollbar-thumb]:bg-[#ccc] [&::-webkit-scrollbar-track]:rounded-xs [&::-webkit-scrollbar-track]:bg-transparent">
          <ol ref={listRef} className="relative space-y-1">
            <AnimatePresence>
              {indicatorRect ? (
                <motion.div
                  key="toc-active-indicator"
                  aria-hidden
                  initial={{
                    x: indicatorRect.left,
                    y: indicatorRect.top,
                    width: indicatorRect.width,
                    height: indicatorRect.height,
                    opacity: 0,
                  }}
                  animate={{
                    x: indicatorRect.left,
                    y: indicatorRect.top,
                    width: indicatorRect.width,
                    height: indicatorRect.height,
                    opacity: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    x: isIndicatorSoftTransition
                      ? INDICATOR_SCROLLING_TRANSITION
                      : INDICATOR_TRANSITION,
                    y: isIndicatorSoftTransition
                      ? INDICATOR_SCROLLING_TRANSITION
                      : INDICATOR_TRANSITION,
                    width: isIndicatorSoftTransition
                      ? INDICATOR_SCROLLING_TRANSITION
                      : INDICATOR_TRANSITION,
                    height: isIndicatorSoftTransition
                      ? INDICATOR_SCROLLING_TRANSITION
                      : INDICATOR_TRANSITION,
                    opacity: INDICATOR_VISIBILITY_TRANSITION,
                  }}
                  className="border-l-primary bg-primary/10 pointer-events-none absolute top-0 left-0 rounded-xs border-l-2"
                />
              ) : null}
            </AnimatePresence>

            {tocItems.map(item => {
              const isActive = item.id === activeId

              return (
                <li
                  key={`${item.id}-${item.text}`}
                  className={cn(
                    'min-w-0 leading-5',
                    item.depth === 2 && 'ml-2',
                    item.depth === 3 && 'ml-4'
                  )}
                >
                  <a
                    ref={el => {
                      if (el) {
                        linkRefs.current.set(item.id, el)
                        return
                      }
                      linkRefs.current.delete(item.id)
                    }}
                    href={`#${item.id}`}
                    onClick={event => handleTocClick(event, item.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'font-en-sans text-muted-foreground relative z-1 block truncate py-px pl-2 text-[13px] transition-[color,font-weight]',
                      'hover:text-primary pr-2',
                      isActive && 'text-primary'
                    )}
                  >
                    {item.text}
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </aside>
  )
}
