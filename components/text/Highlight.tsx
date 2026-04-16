'use client'

import { highlightSplit } from 'omn'
import type { ComponentProps } from 'react'

import { cn } from '@/utils/style'

export interface HighlightProps extends Omit<ComponentProps<'span'>, 'children'> {
  text?: string
  children?: string
  keywords?: string | string[]
  highlightColor?: string
  highlightClassName?: string
}

export function Highlight({
  text,
  children,
  keywords,
  className,
  highlightColor = '#ffec99',
  highlightClassName,
  ...props
}: HighlightProps) {
  const sourceText = text ?? children ?? ''
  const keywordList = (Array.isArray(keywords) ? keywords : [keywords])
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)

  if (!sourceText || keywordList.length === 0) {
    return (
      <span className={className} {...props}>
        {sourceText}
      </span>
    )
  }

  const fragments = highlightSplit(
    sourceText,
    keywordList.length === 1 ? keywordList[0] : keywordList
  )

  return (
    <span className={className} {...props}>
      {fragments.map((fragment, index) => {
        if (!fragment.highlight) {
          return <span key={`${fragment.text}-${index}`}>{fragment.text}</span>
        }

        return (
          <mark
            key={`${fragment.text}-${index}`}
            className={cn('mx-0.5 rounded-xs px-0.5 text-inherit', highlightClassName)}
            style={{ backgroundColor: highlightColor }}
          >
            {fragment.text}
          </mark>
        )
      })}
    </span>
  )
}
