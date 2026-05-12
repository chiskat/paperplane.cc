'use client'

import { useInView } from 'motion/react'
import { useLayoutEffect, useRef } from 'react'
import type React from 'react'
import { annotate } from 'rough-notation'
import { type RoughAnnotation } from 'rough-notation/lib/model'

import { cn } from '@/utils/style'

type AnnotationAction =
  | 'highlight'
  | 'underline'
  | 'box'
  | 'circle'
  | 'strike-through'
  | 'crossed-off'
  | 'bracket'

interface HighlighterProps {
  children: React.ReactNode
  className?: string
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
}

export function Highlighter({
  children,
  className,
  action = 'highlight',
  color = '#ffd1dc',
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)

  const isInView = useInView(elementRef, {
    once: true,
    margin: '-10%',
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useLayoutEffect(() => {
    const element = elementRef.current
    let annotation: RoughAnnotation | null = null
    let frameId: number | null = null

    if (shouldShow && element) {
      const annotationConfig = {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
      }

      const currentAnnotation = annotate(element, annotationConfig)
      annotation = currentAnnotation
      currentAnnotation.show()

      const syncPosition = () => {
        if (frameId !== null) {
          return
        }

        frameId = window.requestAnimationFrame(() => {
          frameId = null
          currentAnnotation.show()
        })
      }

      window.addEventListener('scroll', syncPosition, { passive: true, capture: true })

      return () => {
        window.removeEventListener('scroll', syncPosition, true)

        if (frameId !== null) {
          window.cancelAnimationFrame(frameId)
        }

        currentAnnotation.remove()
      }
    }

    return () => {
      ;(annotation as any)?.remove()
    }
  }, [shouldShow, action, color, strokeWidth, animationDuration, iterations, padding, multiline])

  return (
    <span ref={elementRef} className={cn('relative inline-block bg-transparent', className)}>
      {children}
    </span>
  )
}
