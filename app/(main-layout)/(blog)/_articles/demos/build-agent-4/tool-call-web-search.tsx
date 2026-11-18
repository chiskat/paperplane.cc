import type { ToolUIPart } from 'ai'
import { ChevronDownIcon, GlobeIcon, SearchIcon } from 'lucide-react'
import { useState } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ai-elements/deps/collapsible'

const getFaviconUrl = (favicon: unknown, url: string) => {
  if (typeof favicon === 'string' && favicon) {
    return favicon
  }

  try {
    return `${new URL(url).origin}/favicon.ico`
  } catch {
    return ''
  }
}

export interface ToolCallWebSearchProps {
  part: ToolUIPart
}

interface SearchResultFaviconProps {
  src: string
}

function SearchResultFavicon({ src }: SearchResultFaviconProps) {
  const [hasError, setHasError] = useState(!src)

  if (hasError) {
    return <GlobeIcon aria-hidden className="text-muted-foreground size-4" />
  }

  return (
    <img
      alt=""
      aria-hidden
      className="size-4 object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
      src={src}
    />
  )
}

export function ToolCallWebSearch({ part }: ToolCallWebSearchProps) {
  const input =
    part.input && typeof part.input === 'object' ? (part.input as Record<string, unknown>) : {}
  const output =
    part.output && typeof part.output === 'object' ? (part.output as Record<string, unknown>) : {}
  const query =
    (typeof input.query === 'string' && input.query) ||
    (typeof output.query === 'string' && output.query) ||
    ''
  const results = Array.isArray(output.results) ? output.results : []
  const outputError = typeof output.error === 'string' ? output.error : ''

  return (
    <Collapsible
      className="group not-prose w-full overflow-hidden rounded-md border"
      defaultOpen={false}
    >
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left">
        <div className="flex min-w-0 items-center gap-2">
          <SearchIcon aria-hidden className="text-muted-foreground size-4 shrink-0" />
          <span className="truncate text-sm font-medium">
            {query ? `搜索 ${query}` : '联网搜索'}
          </span>
        </div>
        <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 p-3">
        {part.state === 'input-streaming' && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <SearchIcon aria-hidden className="size-4" />
            正在搜索相关网页...
          </div>
        )}

        {part.errorText && (
          <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {part.errorText}
          </div>
        )}

        {outputError && (
          <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {outputError}
          </div>
        )}

        {results.length > 0 ? (
          <div className="divide-y rounded-md border">
            {results.map((item, resultIndex) => {
              const result =
                item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
              const url = typeof result.url === 'string' ? result.url : ''

              if (!url) {
                return null
              }

              const faviconUrl = getFaviconUrl(result.favicon, url)

              return (
                <a
                  className="hover:bg-muted/70 flex items-start gap-3 p-3 transition-colors first:rounded-t-md last:rounded-b-md"
                  href={url}
                  key={`${url}-${resultIndex}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="bg-muted mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm">
                    <SearchResultFavicon src={faviconUrl} />
                  </span>
                  <span className="min-w-0 space-y-1">
                    <span className="block truncate text-sm font-medium">
                      {typeof result.title === 'string' && result.title ? result.title : url}
                    </span>
                    <span className="text-muted-foreground block text-xs break-all">{url}</span>
                  </span>
                </a>
              )
            })}
          </div>
        ) : (
          part.state === 'output-available' &&
          !outputError && <div className="text-muted-foreground text-sm">没有找到相关结果。</div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
