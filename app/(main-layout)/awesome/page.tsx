'use client'

import { IconArrowsSort, IconCategoryPlus, IconTags } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import { useSession } from '@/lib/auth-client'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { CategoryEditButton, type CategoryFormValue } from './_category/CategoryEditButton'
import { CategorySortButton } from './_category/CategorySortButton'
import { ListCategory } from './_list/ListCategory'
import { Sidebar } from './_sidebar/Sidebar'
import { TagManageButton } from './_tag/TagManageButton'

const TOP_OFFSET = 184

export default function AwesomePage() {
  const { user, isPending } = useSession()

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
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const { data = [] } = useQuery({
    ...trpc.awesome.items.tree.queryOptions(),
    initialData: [],
  })

  const [keyword, setKeyword] = useState('')

  const createCategoryMutation = useMutation({
    mutationFn: async (value: CategoryFormValue) => {
      return await trpcClient.awesome.catelogs.add.mutate(value)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: trpc.awesome.items.tree.pathKey() }),
        queryClient.invalidateQueries({ queryKey: trpc.awesome.catelogs.tree.pathKey() }),
        queryClient.invalidateQueries({ queryKey: trpc.awesome.catelogs.list.pathKey() }),
      ])
    },
  })
  const updateCategoryMutation = useMutation({
    mutationFn: async (value: CategoryFormValue) => {
      return await trpcClient.awesome.catelogs.update.mutate(value)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: trpc.awesome.items.tree.pathKey() }),
        queryClient.invalidateQueries({ queryKey: trpc.awesome.catelogs.tree.pathKey() }),
        queryClient.invalidateQueries({ queryKey: trpc.awesome.catelogs.list.pathKey() }),
      ])
    },
  })
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

  const categoryChildrenCountMap = useMemo(() => {
    const childrenCountMap = new Map<string, number>()
    for (const catelog of data) {
      if (!catelog.parentId) {
        continue
      }
      childrenCountMap.set(catelog.parentId, (childrenCountMap.get(catelog.parentId) ?? 0) + 1)
    }
    return childrenCountMap
  }, [data])

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)]">
        <Sidebar onScrollToSection={scrollToSection} />

        <div className="min-w-0">
          <div className="sticky top-28 z-40">
            <div
              className="pointer-events-none absolute -top-5 -right-3 bottom-0 -left-3 bg-white"
              style={{
                backgroundColor: 'transparent',
                backgroundImage: 'radial-gradient(transparent 1px, #fff 1px)',
                backgroundSize: '4px 4px',
                backdropFilter: 'blur(3px)',
              }}
              aria-hidden
            />

            <div className="relative flex flex-wrap items-end gap-2">
              <label className="min-w-0 flex-1">
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

              {!isPending && user ? (
                <div className="inline-flex h-10 shrink-0 items-center gap-2">
                  <TagManageButton
                    variant="outline"
                    className="h-10 min-w-20 rounded-xl bg-white px-4 text-sm leading-none hover:bg-slate-50"
                  >
                    <IconTags size={16} />
                    标签管理
                  </TagManageButton>

                  <CategorySortButton
                    variant="outline"
                    className="h-10 min-w-20 rounded-xl bg-white px-4 text-sm leading-none hover:bg-slate-50"
                  >
                    <IconArrowsSort size={16} />
                    类别排序
                  </CategorySortButton>

                  <CategoryEditButton
                    variant="outline"
                    className="h-10 min-w-20 rounded-xl bg-white px-4 text-sm leading-none hover:bg-slate-50"
                    onSubmit={async value => {
                      createCategoryMutation.reset()
                      await createCategoryMutation.mutateAsync(value)
                    }}
                  >
                    <IconCategoryPlus size={16} />
                    添加类别
                  </CategoryEditButton>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-8 pb-12">
            {filteredData.length === 0 ? (
              <p className="text-sm text-slate-500">没有匹配的 Awesome 项</p>
            ) : (
              filteredData.map(catelog => (
                <ListCategory
                  key={catelog.id}
                  catelog={catelog}
                  hasChildren={(categoryChildrenCountMap.get(catelog.id) ?? 0) > 0}
                  onEditCategory={async value => {
                    updateCategoryMutation.reset()
                    await updateCategoryMutation.mutateAsync(value)
                  }}
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
