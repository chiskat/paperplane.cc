'use client'

import { allKms } from 'content-collections'
import type { MDXComponents } from 'mdx/types'
import { useMemo, useState } from 'react'

import kmsMDX from '@/app/(main-layout)/kms/mdx-render'
import { Highlighter } from '@/components/ui/highlighter'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utils/style'
import IntroDoc from './_docs/intro.mdx'
import OfficeActiveDoc from './_docs/office-active.mdx'
import OfficeInstallDoc from './_docs/office-install.mdx'
import WindowsActiveDoc from './_docs/windows-active.mdx'
import WindowsInstallDoc from './_docs/windows-install.mdx'

type KmsDocComponent = (props: { components?: MDXComponents }) => React.JSX.Element

interface KmsDocEntry {
  path: string
  title: string
  group: string | undefined
  Content: KmsDocComponent
}

interface KmsDocGroup {
  key: string
  title?: string
  docs: KmsDocEntry[]
}

interface KmsSidebarItemProps {
  active: boolean
  title: string
  onClick: () => void
}

function KmsSidebarItem({ active, title, onClick }: KmsSidebarItemProps) {
  const [hovered, setHovered] = useState(false)

  const titleNode = (
    <span
      className={cn(
        'flex min-w-0 items-center gap-2 truncate',
        active ? 'text-slate-900' : 'text-slate-700'
      )}
    >
      {title}
    </span>
  )

  const highlightedNode = active ? (
    <Highlighter action="highlight" color="#97d7ff">
      {titleNode}
    </Highlighter>
  ) : hovered ? (
    <Highlighter action="underline" color="#97d7ff" iterations={1} padding={0}>
      {titleNode}
    </Highlighter>
  ) : (
    <span className="relative inline-block bg-transparent">{titleNode}</span>
  )

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'font-title-serif group relative inline-flex max-w-full cursor-pointer self-start rounded-2xl px-1 py-1 text-left text-[20px] transition-all duration-200',
        'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none'
      )}
      aria-current={active ? 'true' : undefined}
    >
      {highlightedNode}
    </button>
  )
}

const docDefinitions: Array<{ path: string; Content: KmsDocComponent }> = [
  { path: 'intro', Content: IntroDoc },
  { path: 'windows-install', Content: WindowsInstallDoc },
  { path: 'windows-active', Content: WindowsActiveDoc },
  { path: 'office-install', Content: OfficeInstallDoc },
  { path: 'office-active', Content: OfficeActiveDoc },
]

const mdxComponents = kmsMDX()

export default function KmsPage() {
  const docs = useMemo<KmsDocEntry[]>(
    () =>
      docDefinitions
        .map(({ path, Content }) => {
          const meta = allKms.find(item => item._meta.path === path)
          if (!meta) {
            return null
          }

          return {
            path,
            title: meta.title,
            group: meta.group,
            Content,
          }
        })
        .filter((item): item is KmsDocEntry => item !== null),
    []
  )

  const groupedDocs = useMemo<KmsDocGroup[]>(() => {
    const grouped = new Map<string, KmsDocGroup>()

    docs.forEach(doc => {
      const groupName = doc.group?.trim()
      const key = groupName || '__ungrouped'
      const exists = grouped.get(key)

      if (exists) {
        exists.docs.push(doc)
        return
      }

      grouped.set(key, {
        key,
        title: groupName || undefined,
        docs: [doc],
      })
    })

    return [...grouped.values()]
  }, [docs])

  const [activeDocPath, setActiveDocPath] = useState(docs[0]?.path ?? '')
  const activeDoc = docs.find(item => item.path === activeDocPath) ?? docs[0]

  return (
    <section className="relative pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-0 h-72 w-72 rounded-full bg-linear-to-br from-sky-200/35 via-orange-100/30 to-transparent blur-3xl"
      />

      <div className="grid gap-6 md:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="min-w-0 md:sticky md:top-28 md:h-[calc(100dvh-11rem)]">
          <ScrollArea
            className={cn(
              'h-full min-h-0 rounded-3xl pr-1',
              '[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-1.5',
              '[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:p-0',
              '**:data-[slot=scroll-area-thumb]:bg-slate-300/45'
            )}
            scrollFade
          >
            <div className="flex flex-col gap-5 pb-4">
              {groupedDocs.map(group => (
                <section key={group.key} className="space-y-1">
                  {group.title ? (
                    <h2 className="flex items-center gap-3 px-1 text-sm font-medium tracking-wide text-slate-400">
                      <span className="shrink-0">{group.title}</span>
                      <span aria-hidden className="h-px min-w-0 flex-1 bg-slate-200/75" />
                    </h2>
                  ) : null}

                  <div className="flex flex-col gap-1">
                    {group.docs.map(doc => {
                      const active = doc.path === activeDoc?.path

                      return (
                        <KmsSidebarItem
                          key={doc.path}
                          title={doc.title}
                          active={active}
                          onClick={() => setActiveDocPath(doc.path)}
                        />
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </ScrollArea>
        </aside>

        <div className="min-w-0 pb-4">
          {activeDoc ? (
            <>
              <h1 className="font-title-serif mb-10 text-3xl text-slate-900">{activeDoc.title}</h1>
              <activeDoc.Content components={mdxComponents} />
            </>
          ) : (
            <p className="text-slate-500">当前没有可展示的文档。</p>
          )}
        </div>
      </div>
    </section>
  )
}
