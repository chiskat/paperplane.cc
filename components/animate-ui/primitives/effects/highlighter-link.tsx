'use client'

import Link from 'next/link'
import { useState } from 'react'
import type React from 'react'

import { Highlighter } from '@/components/ui/highlighter'

type HighlighterAction =
  | 'highlight'
  | 'underline'
  | 'box'
  | 'circle'
  | 'strike-through'
  | 'crossed-off'
  | 'bracket'

type HighlighterOptions = {
  action?: HighlighterAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
}

const DEFAULT_HOVER_HIGHLIGHTER_PROPS: HighlighterOptions = {
  action: 'underline',
  color: '#97d7ff',
  iterations: 1,
  padding: 0,
}

const DEFAULT_ACTIVE_HIGHLIGHTER_PROPS: HighlighterOptions = {
  action: 'highlight',
  color: '#97d7ff',
}

type HighlighterLinkProps = Omit<React.ComponentProps<typeof Link>, 'children'> & {
  children: React.ReactNode
  active?: boolean
  enableHoverHighlighter?: boolean
  enableActiveHighlighter?: boolean
  hoverHighlighterProps?: HighlighterOptions
  activeHighlighterProps?: HighlighterOptions
}

function HighlighterLink({
  children,
  active = false,
  enableHoverHighlighter = true,
  enableActiveHighlighter = true,
  hoverHighlighterProps,
  activeHighlighterProps,
  onMouseEnter,
  onMouseLeave,
  ...props
}: HighlighterLinkProps) {
  const [hovered, setHovered] = useState(false)
  const stableChildren = <span className="relative inline-block bg-transparent">{children}</span>

  const mergedHoverHighlighterProps = {
    ...DEFAULT_HOVER_HIGHLIGHTER_PROPS,
    ...hoverHighlighterProps,
  }
  const mergedActiveHighlighterProps = {
    ...DEFAULT_ACTIVE_HIGHLIGHTER_PROPS,
    ...activeHighlighterProps,
  }

  const renderedChildren = active ? (
    enableActiveHighlighter ? (
      <Highlighter {...mergedActiveHighlighterProps}>{children}</Highlighter>
    ) : (
      stableChildren
    )
  ) : hovered && enableHoverHighlighter ? (
    <Highlighter {...mergedHoverHighlighterProps}>{children}</Highlighter>
  ) : (
    stableChildren
  )

  return (
    <Link
      aria-current={active ? (props['aria-current'] ?? 'page') : props['aria-current']}
      onMouseEnter={event => {
        setHovered(true)
        onMouseEnter?.(event)
      }}
      onMouseLeave={event => {
        setHovered(false)
        onMouseLeave?.(event)
      }}
      {...props}
    >
      {renderedChildren}
    </Link>
  )
}

export {
  HighlighterLink,
  type HighlighterAction,
  type HighlighterLinkProps,
  type HighlighterOptions,
}
