'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import { useTRPC } from '@/lib/trpc-client'
import { AwesomeCategorySection } from './AwesomeCategorySection'
import { CategorySidebar } from './CategorySidebar'

const TOP_OFFSET = 184

export default function AwesomePage() {
  const sectionRefs = useRef(new Map<string, HTMLElement>())
  const scrollToSection = (id: string) => {
    const target = sectionRefs.current.get(id)
    if (!target) {
      return
    }

    const top = target.getBoundingClientRect().top + window.scrollY - TOP_OFFSET
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
  }

  const trpc = useTRPC()
  const { data = [] } = useQuery({
    ...trpc.awesome.items.tree.queryOptions(),
    initialData: [],
  })

  const [keyword, setKeyword] = useState('')
  const filteredData = useMemo(() => {
    const keywordText = keyword.trim().toLowerCase()
    if (!keywordText) {
      return data
    }

    return data
      .map(catelog => ({
        ...catelog,
        underAwesomes: catelog.underAwesomes.filter(item => {
          const text = [
            item.label,
            item.desc || '',
            catelog.name,
            catelog.parent?.name || '',
            ...(item.tags?.map(tag => tag.label) || []),
          ]
            .join(' ')
            .toLowerCase()

          return text.includes(keywordText)
        }),
      }))
      .filter(catelog => catelog.underAwesomes.length > 0)
  }, [data, keyword])

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)]">
        <CategorySidebar onScrollToSection={scrollToSection} />

        <div className="min-w-0">
          <div className="sticky top-28 z-40">
            <div
              className="pointer-events-none absolute -top-5 -right-3 bottom-0 -left-3"
              style={{
                backgroundColor: 'transparent',
                backgroundImage: 'radial-gradient(transparent 1px, #fff 1px)',
                backgroundSize: '4px 4px',
                backdropFilter: 'blur(3px)',
              }}
              aria-hidden
            />

            <div className="relative">
              <label className="block">
                <span className="font-en-sans mb-2 block text-xs tracking-wide text-slate-500 uppercase">
                  搜索 Awesome
                </span>
                <Input
                  value={keyword}
                  onChange={event => void setKeyword(event.target.value)}
                  placeholder="搜索名称、描述或标签"
                  className="h-10 rounded-xl bg-white px-4 text-sm text-slate-800 focus-visible:border-slate-500 focus-visible:ring-slate-200"
                />
              </label>
            </div>
          </div>

          <div className="space-y-8 pb-12">
            {filteredData.length === 0 ? (
              <p className="text-sm text-slate-500">没有匹配的 Awesome 项</p>
            ) : (
              filteredData.map(catelog => (
                <AwesomeCategorySection
                  key={catelog.id}
                  catelog={catelog}
                  sectionRef={element => {
                    if (element) {
                      sectionRefs.current.set(catelog.id, element)
                    } else {
                      sectionRefs.current.delete(catelog.id)
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
