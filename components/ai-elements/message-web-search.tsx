'use client'

import { cjk } from '@streamdown/cjk'
import { code } from '@streamdown/code'
import { math } from '@streamdown/math'
import { mermaid } from '@streamdown/mermaid'
import { GlobeIcon } from 'lucide-react'
import { memo } from 'react'
import type { ComponentProps } from 'react'
import remarkBreaks from 'remark-breaks'
import { defaultRemarkPlugins, Streamdown, type StreamdownProps } from 'streamdown'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ai-elements/deps/hover-card'
import { cn } from '@/utils/style'
import { MessageResponseProps } from './message'

const streamdownPlugins = { cjk, code, math, mermaid }

type MarkdownNode = {
  children?: MarkdownNode[]
  data?: { hName?: string; hProperties?: Record<string, string> }
  title?: string
  type: string
  url?: string
  value?: string
}

export interface WebSearchCitation {
  favicon?: string
  id: string
  title?: string
  url: string
}

export interface MessageResponseWebSearchProps extends MessageResponseProps {
  citations?: Record<string, WebSearchCitation>
  citationNumbers?: Record<string, number>
}

const citationPattern = /\[cite:([a-zA-Z0-9_-]+)\]/g

function splitCitationText(
  value: string,
  citations: Record<string, WebSearchCitation>,
  citationNumbers: Record<string, number>
): MarkdownNode[] {
  const nodes: MarkdownNode[] = []
  let lastIndex = 0

  for (const match of value.matchAll(citationPattern)) {
    const matchIndex = match.index ?? 0
    const id = match[1]

    if (matchIndex > lastIndex) {
      nodes.push({ type: 'text', value: value.slice(lastIndex, matchIndex) })
    }

    const citation = citations[id]
    nodes.push(
      citation
        ? {
            children: [{ type: 'text', value: `#${citationNumbers[id] ?? 1}` }],
            data: {
              hName: 'citation',
              hProperties: {
                href: citation.url,
                title: citation.title ?? '',
                favicon: citation.favicon ?? '',
              },
            },
            type: 'citation',
          }
        : { type: 'text', value: `[${id}]` }
    )
    lastIndex = matchIndex + match[0].length
  }

  if (lastIndex < value.length) {
    nodes.push({ type: 'text', value: value.slice(lastIndex) })
  }

  return nodes
}

function remarkCitations({
  citations,
  citationNumbers,
}: Required<Pick<MessageResponseWebSearchProps, 'citations' | 'citationNumbers'>>) {
  return (tree: MarkdownNode | undefined) => {
    const visit = (node: MarkdownNode | undefined) => {
      if (!node?.children || ['code', 'html', 'inlineCode', 'link'].includes(node.type)) {
        return
      }

      node.children = node.children.flatMap(child => {
        if (child.type === 'text' && child.value?.match(citationPattern)) {
          return splitCitationText(child.value, citations, citationNumbers)
        }

        visit(child)
        return child
      })
    }

    visit(tree)
  }
}

const streamdownRemarkPlugins = [...Object.values(defaultRemarkPlugins), remarkBreaks]

const Citation = ({
  href,
  title,
  favicon,
  children,
}: ComponentProps<'a'> & { favicon?: string }) => {
  const citationUrl = href ?? ''
  const citationTitle = title || citationUrl
  const link = (
    <a
      aria-label={`来源${title ? `：${title}` : ''}`}
      className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 mx-0.5 inline-flex items-center gap-1 rounded border px-1 py-px align-baseline text-[0.7em] leading-tight font-medium no-underline transition-colors"
      href={citationUrl}
      rel={citationUrl.startsWith('http') ? 'noreferrer' : undefined}
      target={citationUrl.startsWith('http') ? '_blank' : undefined}
      title={title}
    >
      <span className="relative inline-flex size-3 shrink-0 items-center justify-center">
        <GlobeIcon aria-hidden className="text-muted-foreground size-3" />
        {favicon && (
          <img
            alt=""
            aria-hidden
            className="bg-background absolute inset-0 size-3 object-contain"
            onError={event => {
              event.currentTarget.hidden = true
            }}
            src={favicon}
          />
        )}
      </span>
      {children}
    </a>
  )

  return (
    <HoverCard closeDelay={100} openDelay={300}>
      <HoverCardTrigger asChild>{link}</HoverCardTrigger>
      <HoverCardContent className="w-80 space-y-2 p-3" side="top">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative inline-flex size-5 shrink-0 items-center justify-center">
            <GlobeIcon aria-hidden className="text-muted-foreground size-4" />
            {favicon && (
              <img
                alt=""
                aria-hidden
                className="bg-popover absolute inset-0 size-5 object-contain"
                onError={event => {
                  event.currentTarget.hidden = true
                }}
                src={favicon}
              />
            )}
          </span>
          <a
            className="truncate text-sm font-medium hover:underline"
            href={citationUrl}
            rel="noreferrer"
            target="_blank"
          >
            {citationTitle}
          </a>
        </div>
        <a
          className="text-muted-foreground text-xs break-all hover:underline"
          href={citationUrl}
          rel="noreferrer"
          target="_blank"
        >
          {citationUrl}
        </a>
      </HoverCardContent>
    </HoverCard>
  )
}

export const MessageResponseWebSearch = memo(
  ({
    citationNumbers = {},
    citations = {},
    className,
    ...props
  }: MessageResponseWebSearchProps) => {
    const remarkPlugins: NonNullable<StreamdownProps['remarkPlugins']> = [
      ...streamdownRemarkPlugins,
      [remarkCitations, { citations, citationNumbers }],
    ]

    return (
      <Streamdown
        className={cn('size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}
        plugins={streamdownPlugins}
        remarkPlugins={remarkPlugins}
        allowedTags={{ citation: ['href', 'title', 'favicon'] }}
        components={{ citation: Citation } as NonNullable<StreamdownProps['components']>}
        linkSafety={{ enabled: false }}
        caret="circle"
        animated
        {...props}
      />
    )
  },
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    nextProps.isAnimating === prevProps.isAnimating &&
    prevProps.citations === nextProps.citations &&
    prevProps.citationNumbers === nextProps.citationNumbers
)

MessageResponseWebSearch.displayName = 'MessageResponseWebSearch'
