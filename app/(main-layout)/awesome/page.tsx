'use client'

import { IconArrowsSort, IconCategoryPlus } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useSession } from '@/lib/auth-client'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { CategoryForm, type CategoryFormValue } from './CategoryForm'
import { ListCategory } from './ListCategory'
import { Sidebar } from './Sidebar'

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
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

  const createCategoryMutation = useMutation({
    mutationFn: async (value: CategoryFormValue) => {
      return await trpcClient.awesome.catelogs.add.mutate(value)
    },
    onSuccess: async () => {
      setCategoryDialogOpen(false)
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

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)]">
        <Sidebar onScrollToSection={scrollToSection} />

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
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 min-w-20 rounded-xl bg-white px-4 text-sm leading-none hover:bg-slate-50"
                  >
                    <IconArrowsSort size={16} />
                    类别排序
                  </Button>

                  <Dialog
                    open={categoryDialogOpen}
                    onOpenChange={open => {
                      setCategoryDialogOpen(open)
                      if (open) {
                        createCategoryMutation.reset()
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 min-w-20 rounded-xl bg-white px-4 text-sm leading-none hover:bg-slate-50"
                      >
                        <IconCategoryPlus size={16} />
                        添加类别
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-[min(92vw,720px)] p-0 sm:max-w-[min(92vw,720px)]">
                      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                        <DialogHeader className="mb-4">
                          <DialogTitle className="text-xl">添加类别</DialogTitle>
                          <DialogDescription className="text-base">
                            创建一个 Awesome 类别。
                          </DialogDescription>
                        </DialogHeader>

                        <CategoryForm
                          pending={createCategoryMutation.isPending}
                          submitError={createCategoryMutation.error?.message ?? null}
                          onSubmit={async value => {
                            await createCategoryMutation.mutateAsync(value)
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
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
