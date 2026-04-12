'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/utils/style'
import type { TocItem } from './Toc'

const HEADING_OFFSET = 180
const INDICATOR_TRANSITION = { type: 'spring', stiffness: 420, damping: 38, mass: 0.6 } as const
const INDICATOR_VISIBILITY_TRANSITION = { duration: 0.16, ease: 'easeOut' } as const

interface IndicatorRect {
  top: number
  left: number
  width: number
  height: number
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

    if (heading.getBoundingClientRect().top <= HEADING_OFFSET) {
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
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect | null>(null)
  const tocIdSet = useMemo(() => new Set(tocItems.map(item => item.id)), [tocItems])
  const listRef = useRef<HTMLOListElement>(null)
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())

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
        setActiveId(hashId)
        return
      }

      onScrollLikeEvent()
    }

    updateActiveId()
    window.addEventListener('scroll', onScrollLikeEvent, { passive: true })
    window.addEventListener('resize', onScrollLikeEvent)
    window.addEventListener('hashchange', onHashChange)

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }

      window.removeEventListener('scroll', onScrollLikeEvent)
      window.removeEventListener('resize', onScrollLikeEvent)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [tocItems, tocIdSet])

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

  return (
    <aside className="mb-6 lg:absolute lg:inset-y-0 lg:right-0 lg:mb-0 lg:w-68">
      <div className="relative overflow-hidden rounded-sm border border-[#d6dce5] px-4 py-3 shadow-[0px_0px_3px_1px_#eee] backdrop-blur-xs before:pointer-events-none before:absolute before:top-0 before:right-0 before:left-0 before:h-8 before:bg-linear-to-b before:from-white/60 before:to-transparent lg:sticky lg:top-36 lg:flex lg:max-h-[calc(100vh-10rem)] lg:flex-col">
        <h2 className="font-title-serif relative mb-4 pb-3 text-base text-[18px] text-[#4a5665] after:absolute after:-right-4 after:bottom-0 after:-left-4 after:border-b after:border-dashed after:border-[#356daa]/40">
          <a href="#article-top">{title}</a>
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
                    x: INDICATOR_TRANSITION,
                    y: INDICATOR_TRANSITION,
                    width: INDICATOR_TRANSITION,
                    height: INDICATOR_TRANSITION,
                    opacity: INDICATOR_VISIBILITY_TRANSITION,
                  }}
                  className="pointer-events-none absolute top-0 left-0 rounded-xs border-l-2 border-l-[#c0332f] bg-[#f8efef]"
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
                    onClick={() => setActiveId(item.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'font-en-sans relative z-1 block truncate py-px pl-2 text-[13px] text-[#4a5665] transition-colors',
                      'pr-2 hover:text-[#c0332f]',
                      isActive && 'text-[#c0332f]'
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
