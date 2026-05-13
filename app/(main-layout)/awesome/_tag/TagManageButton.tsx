'use client'

import { IconArrowsSort, IconPlus, IconTag } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { TagDeleteButton } from './TagDeleteButton'
import { TagEditButton, type TagFormValue } from './TagEditButton'
import { TagSortButton } from './TagSortButton'

export interface TagManageButtonProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  children?: ReactNode
}

function normalizeText(value?: string | null) {
  const text = value?.trim()
  return text ? text : null
}

export function TagManageButton({ children, ...restProps }: TagManageButtonProps) {
  const [open, setOpen] = useState(false)
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const softButtonClassName =
    'border-slate-200 bg-slate-50 text-[12px] leading-none text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700'

  const { data: tags = [], isPending } = useQuery({
    ...trpc.awesome.tags.list.queryOptions(),
    enabled: open,
    initialData: [],
  })

  const handleCreateTag = async (value: TagFormValue) => {
    await trpcClient.awesome.tags.add.mutate(value)
    await queryClient.invalidateQueries({ queryKey: trpc.awesome.tags.list.pathKey() })
  }

  const handleEditTag = async (value: TagFormValue) => {
    await trpcClient.awesome.tags.update.mutate(value)
    await queryClient.invalidateQueries({ queryKey: trpc.awesome.tags.list.pathKey() })
  }

  return (
    <Dialog open={open} onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}>
      <DialogTrigger asChild>
        <Button type="button" {...restProps}>
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader title="标签管理" description="查看和管理所有 Awesome 标签" />

        <DialogBody scrollFade>
          {isPending ? (
            <div className="text-muted-foreground py-8 text-center text-sm">加载中...</div>
          ) : tags.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">暂无标签</div>
          ) : (
            <div className="space-y-3">
              {tags.map(tag => {
                const icon = normalizeText(tag.icon)
                const color = normalizeText(tag.color)

                return (
                  <div
                    key={tag.id}
                    className="bg-card hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                      {icon ? (
                        <img
                          src={icon}
                          alt=""
                          aria-hidden
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <IconTag aria-hidden size={24} className="text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm leading-tight font-medium">{tag.label}</h3>
                        {color && (
                          <span
                            className="border-border inline-block h-4 w-4 shrink-0 rounded-none border"
                            style={{ backgroundColor: color }}
                            title={`颜色: ${color}`}
                          />
                        )}
                      </div>
                      {tag.desc && (
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                          {tag.desc}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <TagEditButton
                        tagId={tag.id}
                        variant="outline"
                        size="xs"
                        className={softButtonClassName}
                        onSubmit={handleEditTag}
                      >
                        编辑
                      </TagEditButton>

                      <TagDeleteButton
                        tagId={tag.id}
                        tagName={tag.label}
                        variant="outline"
                        size="xs"
                        className={softButtonClassName}
                      >
                        删除
                      </TagDeleteButton>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <div className="mr-auto flex items-center gap-2">
            <TagSortButton variant="outline" size="lg">
              <IconArrowsSort size={16} />
              排序
            </TagSortButton>

            <TagEditButton variant="outline" size="lg" onSubmit={handleCreateTag}>
              <IconPlus size={16} />
              添加
            </TagEditButton>
          </div>

          <DialogClose asChild>
            <Button variant="outline" size="lg">
              关闭
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
