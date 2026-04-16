'use client'

import { useRouter, useSelectedLayoutSegment } from 'next/navigation'
import { createElement } from 'react'
import type { ReactNode } from 'react'

import { allSnippets } from '@/.content-collections/generated'
import { Tabs, TabsList, TabsTrigger } from '@/components/animate-ui/components/radix/tabs'
import { getSnippetIconByKey } from '@/components/icon/snippet-icons'

export interface SnippetCatalogOption {
  slug: string
  title: string
  iconKey: string
  children: string[]
}

interface SnippetCatalogLayoutClientProps {
  currentCatalog: SnippetCatalogOption
  children: ReactNode
}

const snippetTitleMap = new Map(
  allSnippets
    .map(item => {
      const normalizedPath = item._meta.path.replaceAll('\\', '/')
      const [rawCatalog, ...sectionParts] = normalizedPath.split('/')
      const section = sectionParts.join('/')

      if (!rawCatalog || !section) {
        return null
      }

      return [getSnippetKey(rawCatalog.replace(/^_+/, ''), section), item.title] as const
    })
    .filter((item): item is readonly [string, string] => item !== null)
)

export function SnippetCatalogLayoutClient({
  currentCatalog,
  children,
}: SnippetCatalogLayoutClientProps) {
  const router = useRouter()
  const segment = useSelectedLayoutSegment()
  const article = decodeSegment(segment)
  const activeArticle = getActiveArticle(currentCatalog.children, article)

  return (
    <section className="space-y-6">
      <div className="sticky top-28 border-b border-slate-200/70">
        <div
          className="pointer-events-none absolute -top-6 -right-3 bottom-0 -left-3 z-20 bg-white"
          style={{
            backgroundColor: 'transparent',
            backgroundImage: 'radial-gradient(transparent 1px, #fff 1px)',
            backgroundSize: '4px 4px',
            backdropFilter: 'blur(3px)',
          }}
          aria-hidden
        />

        <div className="relative isolate z-30 flex flex-wrap items-end gap-4 rounded-lg bg-white/50 pb-4">
          <div
            className="pointer-events-none absolute inset-0 -z-1 rounded-lg"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              maskImage:
                'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.35) 55%, rgba(0, 0, 0, 0) 100%)',
              WebkitMaskImage:
                'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.35) 55%, rgba(0, 0, 0, 0) 100%)',
            }}
            aria-hidden
          />

          <h1 className="font-title-serif flex min-w-0 items-center gap-2 text-[24px] whitespace-nowrap text-[#2d394a]">
            {createElement(getSnippetIconByKey(currentCatalog.iconKey), {
              className: 'shrink-0',
              size: 24,
            })}
            {currentCatalog.title}
          </h1>

          <Tabs
            value={activeArticle}
            onValueChange={value => {
              if (value === article || !currentCatalog.children.includes(value)) {
                return
              }

              router.replace(`/snippet/${currentCatalog.slug}/${value}`)
            }}
            className="ml-3 gap-0"
          >
            <TabsList>
              {currentCatalog.children.map(section => (
                <TabsTrigger
                  key={section}
                  value={section}
                  fill={false}
                  className="h-7.5 cursor-pointer px-3"
                >
                  {getSnippetTitle(currentCatalog.slug, section)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="min-w-0">{children}</div>
    </section>
  )
}

function getActiveArticle(children: string[], article: string) {
  if (children.includes(article)) {
    return article
  }

  return children[0] ?? ''
}

function decodeSegment(segment: string | null) {
  if (!segment) {
    return ''
  }

  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function getSnippetTitle(catalog: string, section: string) {
  return snippetTitleMap.get(getSnippetKey(catalog, section)) ?? section
}

function getSnippetKey(catalog: string, section: string) {
  return `${catalog}/${section}`
}
